const sudoku = [ //list with the sudoku board for testing
    [5,3,0, 0,7,0, 0,0,0],
    [6,0,0, 1,9,5, 0,0,0],
    [0,9,8, 0,0,0, 0,6,0],
    [8,0,0, 0,6,0, 0,0,3],
    [4,0,0, 8,0,3, 0,0,1],
    [7,0,0, 0,2,0, 0,0,6],
    [0,6,0, 0,0,0, 2,8,0],
    [0,0,0, 4,1,9, 0,0,5],
    [0,0,0, 0,8,0, 0,7,9],
] 

function verificar(tablero, fila, col, num) { //Function to check which numbers can be placed in each cell
    for (let i = 0; i < 9; i++)
        if (tablero[fila][i] === num) return false // Checks each row to ensure the number does not repeat

    for (let j = 0; j < 9; j++)
        if (tablero[j][col] === num) return false // Checks each column to ensure the number does not repeat

    const inicio_fila = Math.floor(fila / 3) * 3
    const inicio_col = Math.floor(col / 3) * 3

    for (let i = inicio_fila; i < inicio_fila + 3; i++) // Checks each 3x3 subgrid to ensure the number does not repeat
        for (let j = inicio_col; j < inicio_col + 3; j++)
            if (tablero[i][j] === num) return false
    return true
}

function revisar(Xi, Xj, dominios) { //Funtion to review the domains of each cell and eliminate values that are no longer possible

    let eliminado = false

    const domXi = dominios.get(Xi.toString())
    const domXj = dominios.get(Xj.toString())
    for (const xi of [...domXi]) {
        if (!domXj.some(xj => xj !== xi)) { // search for a value in the domain of Xj that is different from xi
            domXi.splice(domXi.indexOf(xi), 1) // Delete some value from the domain with specific position
            eliminado = true 
        }
    }
    return eliminado
}

function ac3(tablero, dominios) { // Funtion with base on the AC-3 algorithm to reduce domains

    function vecinos(f, c) {
        const vecs = new Set()
        for (let k = 0; k < 9; k++) {
            if (tablero[f][k] === 0 && k !== c) vecs.add(`${f},${k}`)
            if (tablero[k][c] === 0 && k !== f) vecs.add(`${k},${c}`)
        }
        const inicioF = Math.floor(f / 3) * 3
        const inicioC = Math.floor(c / 3) * 3

        for (let i = inicioF; i < inicioF + 3; i++)
            for (let j = inicioC; j < inicioC + 3; j++)
                if (tablero[i][j] === 0 && !(i === f && j === c)) vecs.add(`${i},${j}`)
        return [...vecs].map(s => s.split(',').map(Number))
    }

    const cola = []
    for (const [key] of dominios)
        for (const v of vecinos(...key.split(',').map(Number)))
            cola.push([key.split(',').map(Number), v])

    while (cola.length > 0) {
        const [Xi, Xj] = cola.shift()
        if (revisar(Xi, Xj, dominios)) {
            if (dominios.get(Xi.toString()).length === 0) return false
            for (const Xk of vecinos(...Xi))
                if (Xk.toString() !== Xj.toString())
                    cola.push([Xk, Xi])
        }
    }
    return true
}

function backtrack(tablero) { //Funtion of backtracking to find the solution of the sudoku

    let mejor = null
    let menor = Infinity
    for (let f = 0; f < 9; f++) {
        for (let c = 0; c < 9; c++) {
            if (tablero[f][c] === 0) {
                const count = [1,2,3,4,5,6,7,8,9]
                    .filter(n => verificar(tablero, f, c, n)).length
                if (count < menor) {
                    menor = count
                    mejor = [f, c]
                }
            }
        }
    }

    if (mejor === null) return tablero

    const [fila, col] = mejor

    for (let num = 1; num <= 9; num++) {
        if (verificar(tablero, fila, col, num)) {
            tablero[fila][col] = num
            const resultado = backtrack(tablero, contador)
            if (resultado) return resultado
            tablero[fila][col] = 0
        }
    }
    return null
}
const board = document.getElementById('board')

function construir() { // Function to build the sudoku board in the DOM
  board.innerHTML = ''
  for (let f = 0; f < 9; f++) {
    for (let c = 0; c < 9; c++) {
      const div = document.createElement('div')
      div.className = 'cell'
      if (c === 2 || c === 5) div.classList.add('rb')
      if (f === 2 || f === 5) div.classList.add('bb')
      div.dataset.row = f
      div.dataset.col = c
      const v = sudoku[f][c]
      if (v !== 0) {
        div.classList.add('fixed')
        div.textContent = v
        div.dataset.value = v
      } else {
        const inp = document.createElement('input')
        inp.type = 'number'; inp.min = 1; inp.max = 9
        inp.addEventListener('input', () => {
          const n = parseInt(inp.value)
          if (!n || n < 1 || n > 9) inp.value = ''
        })
        div.appendChild(inp)
        div.dataset.value = '0'
      }
      board.appendChild(div)
    }
  }
}

function leerTablero() { // Function to read the current state of the board from the DOM and return it as a 2D array
  const t = []
  for (let f = 0; f < 9; f++) {
    const fila = []
    for (let c = 0; c < 9; c++) {
      const cel = board.querySelector(`[data-row="${f}"][data-col="${c}"]`)
      const inp = cel.querySelector('input')
      fila.push(inp ? (parseInt(inp.value) || 0) : parseInt(cel.dataset.value))
    }
    t.push(fila)
  }
  return t
}

function resolver() { // Function to solve the sudoku using AC-3 and backtracking, and update the DOM with the solution
  const tablero = leerTablero()
  const vacias = []
  for (let f = 0; f < 9; f++)
    for (let c = 0; c < 9; c++)
      if (tablero[f][c] === 0) vacias.push([f, c])

  const dominios = new Map()
  for (const [f, c] of vacias) {
    const key = `${f},${c}`
    dominios.set(
      key,
      [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => verificar(tablero, f, c, n))
    )
  }

  if (!ac3(tablero, dominios)) {
    document.getElementById('status').textContent = '✗ Sin solución'
    document.getElementById('status').style.color = 'var(--color-text-danger)'
    return
  }

  for (const [key, dom] of dominios) {
    if (dom.length === 1) {
      const [f, c] = key.split(',').map(Number)
      tablero[f][c] = dom[0]
    }
  }

  const sol = backtrack(tablero)
  if (sol) {
    for (const [f, c] of vacias) {
      const cel = board.querySelector(`[data-row="${f}"][data-col="${c}"]`)
      const inp = cel.querySelector('input')
      inp.value = sol[f][c]
      cel.classList.add('solved')
    }
    document.getElementById('status').textContent = '✓ Solución encontrada'
    document.getElementById('status').style.color = 'var(--color-text-success)'
  } else {
    document.getElementById('status').textContent = '✗ Sin solución'
    document.getElementById('status').style.color = 'var(--color-text-danger)'
  }
}

function limpiar() {
  construir()
  document.getElementById('status').textContent = ''
}

construir()