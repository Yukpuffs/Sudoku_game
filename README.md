# Sudoku con algoritmo CSP

a. Variables
Cada celda vacía del tablero representa una variable, identificada por su posición (fila, columna). En total hay 81 celdas, de las cuales las vacías son las variables a asignar.

b. Dominio
El dominio de cada variable es el conjunto de valores enteros posibles: {1, 2, 3, 4, 5, 6, 7, 8, 9}. Las celdas con valor inicial ya asignado no forman parte de las variables, por lo que su dominio no se considera.

c. Restricciones
Cada variable debe satisfacer tres restricciones de diferencia:

Fila: no puede repetirse el mismo valor en ninguna celda de la misma fila.
Columna: no puede repetirse el mismo valor en ninguna celda de la misma columna.
Caja 3×3: no puede repetirse el mismo valor dentro del mismo subcuadro de 3×3 al que pertenece la celda.

Backtraking

El backtraking lo que va a hacer es analizar todas las posibilidades con las cuales se puede llenar cada variable, teniendo en cuenta todas las restricciones dadas anteriormente, en el caso de que se haya puesto una posibilidad que no es se devuelve a la validación y hace el proceso nuevamente. Este proceso necesita varias validaciones por eso utiliza la recursividad para llamarse a si misma.

Algoritmo AC-3  

Este algoritmo se basa en analizar los arcos y dominios de las variables, disminuyendo posibilidades y dominios para un proceso mas eficiente.
