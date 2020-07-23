"use strict"
//Жизнь запутана и ветвиста, как строки моего кода

const menu = {
    newGame() {
        this.continueGame()
        generate.clear()
        generate.generateBoard()
        document.querySelector('#continue').removeAttribute('disabled')
    },
    continueGame() {
        document.querySelector('.control').classList.toggle('js-inactive')
        setTimeout(menu.game, 500)
    },
    game() {
        document.querySelector('.app').classList.toggle('js-inactive')
        document.querySelector('.console').classList.toggle('js-inactive')
    },
    backToMenu() {
        this.game()
        setTimeout(function () {
            document.querySelector('.control').classList.toggle('js-inactive')
        }, 500)
    },
    outputMessageArr: [],
    outputMessage(message, classHtml = 'span'){
        let messageHtml = `<span class=${classHtml} >${message}</span><br>`
        document.querySelector('.output').insertAdjacentHTML('afterbegin', `${messageHtml}`)
        this.outputMessageArr.push(message, classHtml)
    },
    clearMessage() {
        while (document.querySelector('.output').firstChild) {
            document.querySelector('.output').removeChild(document.querySelector('.output').firstChild)
        }
    },
    resetMessage() {
        for (let i = 0; i < this.outputMessageArr.length; i += 2) {
            let messageHtml = `<span class=${this.outputMessageArr[i + 1]} >${this.outputMessageArr[i]}</span><br>`
            document.querySelector('.output').insertAdjacentHTML('afterbegin', `${messageHtml}`)
        }
    },
    flip(e) {
        if (!Number(e.target.dataset.counter)) {
            document.querySelector('.board').style.transform = 'rotate(180deg)'
            document.querySelector('.name-tile-top').style.flexDirection = 'row-reverse'
            document.querySelector('.name-tile-left').style.flexDirection = 'column-reverse'
            e.target.dataset.counter = '1'
        } else if (Number(e.target.dataset.counter)) {
            document.querySelector('.board').style.transform = 'rotate(0deg)'
            document.querySelector('.name-tile-top').style.flexDirection = 'row'
            document.querySelector('.name-tile-left').style.flexDirection = 'column'
            e.target.dataset.counter = '0'
        }

        document.querySelector('.board').classList.toggle('js-active')
        setTimeout(function () {
            for (let a of storage.arraySpace) {
                for (let s of a) {
                    s.classList.toggle('js-flip')
                }
            }
        }, 500)
        setTimeout(function () {
            document.querySelector('.board').classList.toggle('js-active')
        }, 1000)
    }
}

const storage = {
    //Массив клеток доски
    arraySpace: [
        [], [], [], [], [], [], [], []
    ],
    //Массив текущего положения фигур
    //Все не занятые клетки - '0'
    arrayPositionFigure: [
        [], [], [], [], [], [], [], []
    ],
    //Массив иконок фигур
    arrayFigureIcon: new Map([

        [   'whitePawn'     , "<img src='img/whitePawn.png' alt=''>"    ],
        [   'whiteKnight'   , "<img src='img/whiteKnight.png' alt=''>"  ],
        [   'whiteBishop'   , "<img src='img/whiteBishop.png' alt=''>"  ],
        [   'whiteCastle'   , "<img src='img/whiteCastle.png' alt=''>"  ],
        [   'whiteKing'     , "<img src='img/whiteKing.png' alt=''>"    ],
        [   'whiteQueen'    , "<img src='img/whiteQueen.png' alt=''>"   ],

        [   'blackPawn'     , "<img src='img/blackPawn.png' alt=''>"    ],
        [   'blackKnight'   , "<img src='img/blackKnight.png' alt=''>"  ],
        [   'blackBishop'   , "<img src='img/blackBishop.png' alt=''>"  ],
        [   'blackCastle'   , "<img src='img/blackCastle.png' alt=''>"  ],
        [   'blackKing'     , "<img src='img/blackKing.png' alt=''>"    ],
        [   'blackQueen'    , "<img src='img/blackQueen.png' alt=''>"   ]
    ]),
    //Массив с названиями фигур для пользовательской консоли
    nameFigure: new Map([

        [   'whitePawn'    , "Белая пешка"     ],
        [   'whiteKnight'  , "Белый конь"      ],
        [   'whiteBishop'  , "Белый слон"      ],
        [   'whiteCastle'  , "Белая ладья"     ],
        [   'whiteKing'    , "Белый король"    ],
        [   'whiteQueen'   , "Белая королева"  ],

        [   'blackPawn'    , "Черная пешка"    ],
        [   'blackKnight'  , "Черный конь"     ],
        [   'blackBishop'  , "Черный слон"     ],
        [   'blackCastle'  , "Черная ладья"    ],
        [   'blackKing'    , "Черный король"   ],
        [   'blackQueen'   , "Черная королева" ]
    ]),
    //Названия клеток для пользовательской консоли
    nameRow: [8, 7, 6, 5, 4, 3, 2, 1],
    nameCol: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
    //Ассоциативный массив внутри которого ключ - название фигуры
    //значение - многомерный массив с возможными ходами фигуры (row col и модификаторы)
    arrayPossibleMoves: new Map (),
    //Массив клеток "под боем" противоположной стороны
    arrayAttack: [ [], [], [], [], [], [], [], [] ],
}

const generate = {
    clear() {
        storage.arraySpace = [ [], [], [], [], [], [], [], [] ]
        storage.arrayPossibleMoves = new Map ()
        actions.choiceOrMove = true
        move.sideMove = true
        move.counter = 0
        while (document.querySelector('.board').firstChild) {
            document.querySelector('.board').removeChild(document.querySelector('.board').firstChild);
        }
        menu.clearMessage()
        history.saves = {}
        history.counterMax = -1
        menu.outputMessageArr = []
        for (let k of Object.keys(king.castling)) {
            king.castling[k] = false
        }
        document.querySelector('#back').setAttribute('disabled', 'disabled')
        document.querySelector('#forward').setAttribute('disabled', 'disabled')
        localStorage.clear()
    },
    generateBoard(mod = true) {   //Генерируем поле (клетки)
        const a = document.querySelector('.board')

        for (let i = 0; i < 8; i++) {

            a.append(document.createElement('div'))
            a.lastChild.classList = 'row'

            for (let j = 0; j < 8; j++) {

                const q = document.querySelectorAll('.row')[i]
                q.append(document.createElement('div'))

                if (j % 2 === 0) {

                    if (i % 2 === 0) {

                        q.lastChild.classList = 'tile'

                    } else {

                        q.lastChild.classList = 'tile tile-dark'
                    }
                } else {
                    if (i % 2 !== 0) {

                        q.lastChild.classList = 'tile'

                    } else {

                        q.lastChild.classList = 'tile tile-dark'

                    }
                }
                //data-*
                document.querySelectorAll('.row')[i].children[j].dataset.x = `${i}`
                document.querySelectorAll('.row')[i].children[j].dataset.y = `${j}`
                //Заполняет массив arraySpace всеми элементами поля
                storage.arraySpace[i].push(document.querySelectorAll('.row')[i].children[j])
                //Заполняет массивы arrayAttack, arrayPositionFigure '0'
                storage.arrayPositionFigure[i][j] = 0
                storage.arrayAttack[i][j] = 0
            }
        }
        if (mod) {
            generate.render()
        }
    },
    render() {  //Размещаем фигуры на доске и записываем их положение
        let a, b, c, d, k, q
            a = 0
            b = 7
            c = a + 1
            d = b - 1
            k = 4
            q = 3

        for (let i = 0; i < 8; i++) {
            //Пешки
            //Размещаем на поле
            storage.arraySpace[c][i].innerHTML = storage.arrayFigureIcon.get('blackPawn')
            storage.arraySpace[d][i].innerHTML = storage.arrayFigureIcon.get('whitePawn')

            //Записываем положение фигуры
            storage.arrayPositionFigure[c][i] = `blackPawn${i+1}`
            storage.arrayPositionFigure[d][i] = `whitePawn${i+1}`

            //Добавляем название в массив возможных ходов
            storage.arrayPossibleMoves.set(`blackPawn${i+1}`, [])
            storage.arrayPossibleMoves.set(`whitePawn${i+1}`, [])
        }
        for (let i = 0,
                 k = 0,
                 s = 1,
                 f = 2; i < 2;  i++,
                 k += 7,
                 s += 5,
                 f += 3) {
            //Ладьи
            storage.arraySpace[a][k].innerHTML = storage.arrayFigureIcon.get('blackCastle')
            storage.arraySpace[b][k].innerHTML = storage.arrayFigureIcon.get('whiteCastle')


            storage.arrayPositionFigure[a][k] = `blackCastle${i+1}`
            storage.arrayPositionFigure[b][k] = `whiteCastle${i+1}`

            storage.arrayPossibleMoves.set(`blackCastle${i+1}`, [])
            storage.arrayPossibleMoves.set(`whiteCastle${i+1}`, [])

            //Кони
            storage.arraySpace[a][s].innerHTML = storage.arrayFigureIcon.get('blackKnight')
            storage.arraySpace[b][s].innerHTML = storage.arrayFigureIcon.get('whiteKnight')

            storage.arrayPositionFigure[a][s] = `blackKnight${i+1}`
            storage.arrayPositionFigure[b][s] = `whiteKnight${i+1}`

            storage.arrayPossibleMoves.set(`blackKnight${i+1}`, [])
            storage.arrayPossibleMoves.set(`whiteKnight${i+1}`, [])

            //Слоны
            storage.arraySpace[a][f].innerHTML = storage.arrayFigureIcon.get('blackBishop')
            storage.arraySpace[b][f].innerHTML = storage.arrayFigureIcon.get('whiteBishop')

            storage.arrayPositionFigure[a][f] = `blackBishop${i+1}`
            storage.arrayPositionFigure[b][f] = `whiteBishop${i+1}`

            storage.arrayPossibleMoves.set(`blackBishop${i+1}`, [])
            storage.arrayPossibleMoves.set(`whiteBishop${i+1}`, [])
        }
        //Дамы
        storage.arraySpace[a][q].innerHTML = storage.arrayFigureIcon.get('blackQueen')
        storage.arraySpace[b][q].innerHTML = storage.arrayFigureIcon.get('whiteQueen')


        storage.arrayPositionFigure[a][q] = 'blackQueen$'
        storage.arrayPositionFigure[b][q] = 'whiteQueen$'

        storage.arrayPossibleMoves.set(`blackQueen$`, [])
        storage.arrayPossibleMoves.set(`whiteQueen$`, [])

        //Короли
        storage.arraySpace[a][k].innerHTML = storage.arrayFigureIcon.get('blackKing')
        storage.arraySpace[b][k].innerHTML = storage.arrayFigureIcon.get('whiteKing')

        storage.arrayPositionFigure[a][k] = 'blackKing$'
        storage.arrayPositionFigure[b][k] = 'whiteKing$'

        storage.arrayPossibleMoves.set(`blackKing$`, [])
        storage.arrayPossibleMoves.set(`whiteKing$`, [])


        possiblesMoves.preparation() //Определяем возможные ходы
    }
}


const actions = {
    //Режим для клика: выбираем фигуру для перемещения(true) или перемещаем фигуру(false)
    choiceOrMove: true,
    click(e) { //Определяем координаты места по которому кликнули

        let g //Хранит место, по которому кликнули
        //Если кликнули по иконке фигуры
        if (e.target.toString().search('Image') !== -1) {
            //Сохраняем блок в котором иконка
            g = e.target.parentNode
        } else {
            //Сохраняем блок по которому кликнули
            g = e.target
        }
        let row = Number(g.dataset.x)
        let col = Number(g.dataset.y)
        this.$or(row, col)
    },
    //Определяем что делать с выбранной клеткой
    $or(row, col) {
        //Если режим выбора фигуры //И если в выбранной клетке есть фигура
        if (this.choiceOrMove && storage.arrayPositionFigure[row][col]) {
            //И если выбранная фигура той стороны, чей ход
            if (storage.arrayPositionFigure[row][col].search(`${move.sideMove? 'white': 'black'}`) === 0) {
                //Сохраняем координаты и имя выбранной фигуры
                move.row = row
                move.col = col
                move.selectedFigure = storage.arrayPositionFigure[row][col]

                //Лечение перетирания подсвеченных клеток
                backlight.checking()

                //Меняем статус на перемещение
                this.choiceOrMove = false

                //Подсвечиваем на доске выбранную фигуру
                backlight.space(row, col)
                //Подсвечиваем возможные ходы
                backlight.spaces(move.selectedFigure)

            } else { //Если выбрана фигура противоположной стороны
                return menu.outputMessage(`Ход ${move.sideMove? 'белых': 'черных'}`, 'span-orange')
            }
        } else if (!this.choiceOrMove) { //Если режим 'перемещение фигуры'
            //Убираем подсветку выбранной фигуры (в любом случае)
            backlight.space(move.row, move.col, false)
            //Если кликнули по фигуре-союзнику
            if (String(storage.arrayPositionFigure[row][col]).search(`${move.sideMove? 'white': 'black'}`) === 0) {
                //Получаем имена предыдущей и новой фигуры, чтобы упростить себе жизнь
                let nameNewFigure = storage.arrayPositionFigure[row][col]
                let namePastFigure = storage.arrayPositionFigure[move.row][move.col]
                //Сохраняем выбранную фигуру
                move.row = row
                move.col = col
                move.selectedFigure = nameNewFigure
                //Убираем/добавляем подсветку
                backlight.spaces(namePastFigure, false)
                backlight.space(row, col)
                backlight.checking()
                backlight.spaces(nameNewFigure)

            } else {    //Если кликнули по незанятой клетке или вражеской фигуре
                return move.checking(row, col)
            }
        }
    }
}

const move = {
    sideMove: true, //Ход белых(true)/черных(false)
    row: '',        //Сохраняем ряд фигуры, выбранной для перемещения
    col: '',        //Сохраняем индекс в ряду фигуры, которую будем перемещать
    selectedFigure: '', //Аналогично имя фигуры
    counter: 0, //Считаем количество ходов
    checking (row, col) {   //Проверяем есть ли такие координаты среди возможных ходов фигуры
        let nameFigure = storage.arrayPositionFigure[this.row][this.col]
        let arrMoves = storage.arrayPossibleMoves.get(nameFigure) //Массив возможных ходов
        //Проверяем есть ли такие координаты среди возможных ходов
        for (let i = 0; i < arrMoves.length; i++) {
            //Если есть
            if (arrMoves[i][0] === row && arrMoves[i][1] === col && arrMoves[i][3] === true) {
                return this.moving(row, col, nameFigure, arrMoves[i][2])
            }
        }
        //Это выполняется если выбранных координат нет в списке возможных ходов
        //Убираем подсветку возможных ходов
        backlight.spaces(nameFigure, false)
        //Меняем статус клика на выбор фигуры
        actions.choiceOrMove = true
        backlight.checking()

    },
    moving(row, col, nameFigure, mod1) {//Перемещаем фигуру

        if (history.shiftStatus) {
            history.clear()
            history.shiftStatus = false
            history.save()
        }

        //Удаляем фигуру из начальной позиции
        storage.arraySpace[this.row][this.col].innerHTML = ''
        //аналогично из массива положения фигур
        storage.arrayPositionFigure[this.row][this.col] = 0
        //Добавляем фигуру на новое место
        storage.arraySpace[row][col].innerHTML =
            storage.arrayFigureIcon.get(`${this.selectedFigure.substring(0, this.selectedFigure.length - 1)}`)
        //Добавляем фигуру на новое место в массив положения фигур
        storage.arrayPositionFigure[row][col] = this.selectedFigure
        //Меняем статус на выбор фигуры
        actions.choiceOrMove = true
        this.counter++

        menu.outputMessage(`#${this.counter}: ${storage.nameFigure.get(this.selectedFigure.slice(0, -1))} ${storage.nameCol[this.col]
        + storage.nameRow[this.row] + ' ' + storage.nameCol[col] + storage.nameRow[row]}`)
        //Убираем подсветку возможных ходов
        backlight.spaces(nameFigure, false)

        //Удаляем подсветку прошлого хода
        backlight.space(backlight.historyPos.pos1[0], backlight.historyPos.pos1[1], false)
        backlight.space(backlight.historyPos.pos2[0], backlight.historyPos.pos2[1], false)

        //Смена сторон
        this.sideMove = !this.sideMove
        //Если рокировка для королей возможна,
        if (king.castling.blackKing$ || king.castling.whiteKing$) {
            //нужно проверить какой фигурой сделан ход, и если эта фигура король или ладья, то сменить
            //флаг для этой фигуры
            this.$castlingCheck(nameFigure)
        }
        //Если модификатор 1 у хода false
        if (mod1 === false) {
            //Определяем пешка или король
            if(this.selectedFigure.search('King') !== -1) {
                //Если король - рокировка
                this.$castling(row, col, nameFigure)
            } else {
                //Либо пешка, меняем пешку на даму
                this.$exchange(row, col, nameFigure)
            }
        }
        //Подсвечиваем где фигура была и куда переместилась
        backlight.space(this.row, this.col, true, '#4049ff')
        backlight.space(row, col, true, '#4049ff')
        //Чтобы убирать эту подсветку после следующего хода нужно сохранить координаты
        backlight.historyPos.pos1 = [this.row, this.col]
        backlight.historyPos.pos2 = [row, col]
        //Вкостыливаем тут такую штуку, ибо если ходим королем после того, как ему объявлен шах - перетирается
        //подсветка хода
        if (this.selectedFigure.search('King') !== -1) {
            backlight.crutchForKing = [row, col]
        }
        backlight.checking()
        //Определяем возможные ходы фигур
        return possiblesMoves.preparation()
    },
    //Рокировка(перемещаем ладью)
    $castling(row, col, nameFigure) {

        let nameCastle = `${nameFigure.charAt(0) === 'w'? 'white': 'black'}Castle${col < 3? 1: 2}`
        let colCastle = storage.arrayPositionFigure[row].indexOf(nameCastle)
        storage.arraySpace[row][colCastle].innerHTML = ''
        storage.arrayPositionFigure[row][colCastle] = 0
        storage.arraySpace[row][col + (col < 3? 1: -1)].innerHTML =
            storage.arrayFigureIcon.get(`${nameFigure.charAt(0) === 'w'? 'white': 'black'}Castle`)
        storage.arrayPositionFigure[row][col + (col < 3? 1: -1)] = nameCastle

    },
    $exchangeCounter: [1, 1],
    //Пешка дошла до края доски
    $exchange(r, c, name) {

        storage.arrayPossibleMoves.delete(name)
        let color = name.slice(0, 5)
        let newName = `${color}Queen`
        let i
        color.charAt(0) === 'w'? i = this.$exchangeCounter[0]: i = this.$exchangeCounter[1]
        storage.arraySpace[r][c].innerHTML = storage.arrayFigureIcon.get(newName)
        storage.arrayPositionFigure[r][c] = `${newName + i}`
        storage.arrayPossibleMoves.set(`${newName + i}`, [])
        color.charAt(0) === 'w'? this.$exchangeCounter[0]++: this.$exchangeCounter[1]++

    },
    //Если ходим королем или ладьёй, меняем флаг
    $castlingCheck(name) {
        switch (name) {
            case 'blackKing$':
                king.castling.blackKing$ = false
                break
            case 'whiteKing$':
                king.castling.whiteKing$ = false
                break
            case 'blackCastle1':
                king.castling.blackCastle1 = false
                break
            case 'blackCastle2':
                king.castling.blackCastle2 = false
                break
            case 'whiteCastle1':
                king.castling.whiteCastle1 = false
                break
            case 'whiteCastle2':
                king.castling.whiteCastle2 = false
                break
            default:
                break
        }
        if (!king.castling.blackCastle1 && !king.castling.blackCastle2) {
            king.castling.blackKing$ = false
        }
        if (!king.castling.whiteCastle1 && !king.castling.whiteCastle2) {
            king.castling.whiteKing$ = false
        }
    },
}

const backlight = { //Подсветка клеток на поле
    crutchForKing: 0,
    historyPos: {
        pos1: [0, 0],
        pos2: [0, 0],
        posKing: [0, 0],
    },
    checking() {
        if (king.checkStatus && move.selectedFigure.search(`${move.sideMove? 'whiteKing': 'blackKing'}`) === -1) {
            backlight.space(this.historyPos.posKing[0], this.historyPos.posKing[1], true, 'red')
        }
        if (move.counter > 1 || (history.shiftStatus && history.counter > 0)) {
            backlight.space(this.historyPos.pos1[0], this.historyPos.pos1[1], true, 'blue')
            backlight.space(this.historyPos.pos2[0], this.historyPos.pos2[1], true, 'blue')
        }
    },
    //Добавляем/удаляем подсветку для клетки, row, col - ряд и колонка нужной клетки
    //addOrRemove true/false - добавляем/удаляем, color - цвет рамки
    space(row, col, addOrRemove = true, color = 'green') {
        storage.arraySpace[row][col].style.borderColor = addOrRemove? `${color}`: 'transparent'
    },
    //Подсветка возможных ходов
    spaces(name, addOrRemove = true) {
        const arrMove = storage.arrayPossibleMoves.get(name)
        for (let i = 0; i < arrMove.length; i++) {
            if (arrMove[i][3]) {
                storage.arraySpace[arrMove[i][0]][arrMove[i][1]].style.borderColor = addOrRemove? 'orange': 'transparent'
            } else {
                storage.arraySpace[arrMove[i][0]][arrMove[i][1]].style.borderColor = addOrRemove? 'red': 'transparent'
            }
        }
    },
    clear() {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                this.space(r, c, false)
            }
        }
    }
}

const possiblesMoves = {    //Определяем возможные ходы
    preparation(mod = true) {
        //Обнуляем возможные клетки для атаки
        for (let i = 0; i < 8; i++) {
            for (let l = 0; l < 8; l++) {
                mod? storage.arrayAttack[i][l] = 0: checkedMove.arrayAttack[i][l] = 0
            }
        }
        //Для каждой фигуры определяем возможные шаги
        for (let key of storage.arrayPossibleMoves.keys()) {
            if (mod) {
                //Для королей в последнюю очередь
                if (key.search('King') === -1) {
                    this.selecting(key, mod)
                }
            } else {
                if (key.search('King') === -1 && (key.charAt(0) === (!move.sideMove? 'w': 'b'))) {
                    this.selecting(key, mod)
                }
            }
        }
        if (mod) {
            king.possiblesMoves()
            checkedMove.check()
            if (!history.shiftStatus) {
                history.save()
            }
        }
    },
    //Заполняем карту возможных ходов для атаки
    attackMap(array, colorName, mod = true) {
        if (colorName === (!move.sideMove? 'w': 'b')) {
            for (let e of array) {
                mod? storage.arrayAttack[e[0]][e[1]] = 1: checkedMove.arrayAttack[e[0]][e[1]] = 1
            }
        }
    },
    selecting(name, mod) {
        //определяем текущее положение фигуры по названию
        let row
        let col
        for (let r= 0; r < storage.arrayPositionFigure.length; r++) {
            for (let c = 0; c < storage.arrayPositionFigure[r].length; c++) {
                if (mod? storage.arrayPositionFigure[r][c] === name: checkedMove.arrayPositionFigure[r][c] === name) {
                    row = r
                    col = c
                    break
                }
            }
        }
        //Что значит, что фигура удалена с поля
        if (row === undefined && mod) {
            if (mod) {
                //Удаляем фигуру из arrayPossibleMoves
                //чтобы не определять ходы для не существующей фигуры выходим из метода
                storage.arrayPossibleMoves.delete(name)
                return console.log('Фигура ' + name + ' убита')
            } else {
                return
            }
        }
        //Ищем нужную фигуру
        switch (name) {
            case `${name.search('Pawn') !== - 1? name: 'Not'}`:
                pawn.possibleMoves(row, col, name, mod)
                break
            case `${name.search('Knight') !== - 1? name: 'Not'}`:
                knight.possibleMoves(row, col, name, mod)
                break
            case `${name.search('Bishop') !== - 1? name: 'Not'}`:
            case `${name.search('Castle') !== - 1? name: 'Not'}`:
            case `${name.search('Queen') !== - 1? name: 'Not'}`:
                bishopCastleQueen.possibleMoves(row, col, name, mod)
                break
            default:
                break
        }
    }
}

const pawn = {
    possibleMoves(row, col, name, mod) {  //Определяем возможные ходы для пешки
        /* Если белые снизу - menu.changeParties(***убрал эту переменную), и выбранная фигура белая, то
                * модификатор поведения "-" - двигаемся по рядам со знаком минус
        * Если белые снизу и выбранная фигура черная, то
                * "+"
        * Если белые сверху и выбранная фигура белая, то
                * "+"
        * Если белые сверху и выбранная фигура черная, то
                * "-"
            */
        let modifierMove //Модификатор шага
        let colorName = name.charAt(0)
        let arrMove = []   //Собираю все возможные ходы перед тем как их добавить
        let arrMoveAttack = []  //Тут возможные ходы для атаки
        //Если белые снизу и белая фигура ИЛИ белые сверху и черная фигура, то
        if (colorName === 'w') {
            modifierMove = -1
        } else {
            modifierMove = 1
        }
        const modifierEnd = () => {
            if (modifierMove === -1) {
                return (row + modifierMove) !== 0;
            } else {
                return (row + modifierMove) !== 7;
            }
        }
        if (modifierMove === -1 && row > 0 || modifierMove === 1 && row < 7) {
            //Проверяем возможен ли ход на клетку вперед (нет ли там фигуры)
            if (!storage.arrayPositionFigure[row + modifierMove][col]) {
                let mod = modifierEnd()
                //Добавляем возможный ход
                arrMove.push([row + modifierMove, col, mod])
            }
        }
        //Если пешка ещё не делала ход, значит возможнен ход на две клетки вперед
        if ((modifierMove === -1 && row === 6) || (modifierMove === +1 && row === 1)) {

            //Проверяем возможен ли ход на две клетки вперед (нет ли там фигуры)
            if (!storage.arrayPositionFigure[row + modifierMove * 2][col] &&
                !storage.arrayPositionFigure[row + modifierMove][col]) {

                arrMove.push([row + modifierMove * 2, col, true])   //Добавляем возможный ход
            }
        }
        //Может ли пешка ударить фигуру (проверить есть ли вражеская фигура по координатам row + modifierMove, col+-1)
        for (let i = -1; i <= 1; i += 2) {
            //Исключаем клетки за пределами игрового поля
            if (row < 7 && row > 0 && (col + i <= 7) && (col + i >= 0)) {
                let z = storage.arrayPositionFigure[row + modifierMove][col + i]
                //Отдельно добавляем в список возможных ходов для атаки, чтобы потом исключать эти клетки из ходов короля
                arrMoveAttack.push([row + modifierMove, col + i])
                //Если фигура есть И она вражеская (отдельно потенциальный ход пешки)
                if (z && z.charAt(0) !== colorName) {
                    let mod = modifierEnd()
                    //Добавляем возможный ход
                    arrMove.push([row + modifierMove, col + i, mod])
                }
            }
        }
        if (mod) {
            //Добавляем возможные ходы
            storage.arrayPossibleMoves.set(name, arrMove)
        }

        possiblesMoves.attackMap(arrMoveAttack, colorName, mod)
    }
}

const knight = {
    possibleMoves(row, col, name, mod) {
        /*  Варианты ходов коня
                   *   row + 2, col + 1
                   *   row + 2. col - 1
                   *   row - 2, col + 1
                   *   row - 2, col - 1
                   *   col + 2. row + 1
                   *   col + 2, row - 1
                   *   col - 2, row + 1
                   *   col - 2, row - 1
                       *   Для всех нужно проверить
                           *   Входят ли координаты в пределы поля, если нет - исключить
                           *   Есть ли фигура-союзник, если да - исключить   */

        let arrMove = []   //Собираем возможные ходы
        let arrAttack = []
        const colorName = name.charAt(0)

        const arrPossible = [
            [row + 2, col + 1],
            [row + 2, col - 1],
            [row - 2, col + 1],
            [row - 2, col - 1],
            [row + 1, col + 2],
            [row - 1, col + 2],
            [row + 1, col - 2],
            [row - 1, col - 2]
        ]
        //Перебираем все варианты
        for (let i = 0; i < 8; i++) {

            let a = arrPossible[i][0]
            let b = arrPossible[i][1]
            //Если координаты входят в пределы игрового поля
            if (a <= 7 && a >= 0 && b <= 7 && b >= 0) {
                arrAttack.push([a, b])

                //Смотрим что находится в выбранной клетке
                let c = storage.arrayPositionFigure[a][b]
                //И если по этим координатам нет фигуры ИЛИ есть вражеская
                if (!c || c.charAt(0) !== colorName) {
                    //Добавляем возможный ход
                    arrMove.push([a, b, true])
                }
            }
        }
        if (mod) {
            //Добавляем все возможные ходы
            storage.arrayPossibleMoves.set(name, arrMove)
        }

        possiblesMoves.attackMap(arrAttack, colorName, mod)
    }
}

const bishopCastleQueen = {
    possibleMoves(row, col, name, mod) {
        //======================================================================================================
        /*  Возможные ходы для слона:
            *   row + i, col + i
            *   row + i, col - i
            *   row - i, col + i
            *   row - i, col - i
                *   i = 1, i++
                    *   Увеличиваем i пока:
                        *   не выйдем за пределы игрового поля (по row ИЛИ col) или
                        *   не встретим другую фигуру и:
                            *   если фигура вражеская, то включаем эту клетку в возможные ходы
                            *   если фигура союзник, то не включаем эту клетку в возможные ходы   */
        //======================================================================================================
        /*  Возможные ходы для ладьи:
           *   row++
           *   col++
           *   row--
           *   col--
               *   Остальное аналогично слону*/
        //======================================================================================================
        /*  Дама объединяет правила слона и ладьи  */

        const colorName = name.charAt(0)
        let nameFigure
        if (name.search('Bishop') !== -1) {
            nameFigure = 'Bishop'
        } else if (name.search('Castle') !== -1) {
            nameFigure = 'Castle'
        } else {
            nameFigure = name
        }

        //Собираем возможные ходы
        let arrMove = []
        let arrAttack = []
        //Для слона и ладьи выполнять код нужно только раз, а для дамы - два (оба варианта)
        for (let q = 0; q < 2; q++) {
            if (nameFigure === 'Castle') {
                q = 1
            }
            for (let k = 0; k < 4; k++) {   //4 направления движения

                let w, s

                if (k === 0) {
                    if (q === 0) { w = 1  ; s = 1  }   else
                    if (q === 1) { w = 1  ; s = 0  }
                }  else
                if (k === 1) {
                    if (q === 0) { w = 1  ; s = -1 }   else
                    if (q === 1) { w = -1 ; s = 0  }
                }  else
                if (k === 2) {
                    if (q === 0) { w = -1 ; s = 1  }   else
                    if (q === 1) { w = 0  ; s = 1  }
                }  else
                if (k === 3) {
                    if (q === 0) { w = -1 ; s = -1 }   else
                    if (q === 1) { w = 0  ; s = -1 }
                }

                for (let i = 1; i < 8; i++) {   //7 - максимальное число ходов в одном направлении
                    //Если координаты входят в пределы игрового поля
                    if (row + w >= 0 &&
                        row + w <= 7 &&
                        col + s >= 0 &&
                        col + s <= 7)   {


                        //Смотрим что находится в выбранной клетке
                        let a
                        if (mod) {
                            a = storage.arrayPositionFigure[row + w][col + s]
                        } else {
                            a = checkedMove.arrayPositionFigure[row + w][col + s]
                        }
                        //Если в выбранной клетке нет фигуры
                        if (!a) {
                            //Добавляем возможный ход
                            arrMove.push([row + w, col + s, true])
                            //Если есть вражеская фигура
                            arrAttack.push([row + w, col + s])
                        } else if (a.charAt(0) !== colorName) {
                            arrAttack.push([row + w, col + s])
                            //Добавляем возможный ход
                            arrMove.push([row + w, col + s, true])
                            //И выходим из цикла, иначе мы перепрыгнем фигуру
                            break
                            //Если фигура союзник
                        } else {
                            //Только для attack map, чтобы исключить для короля
                            arrAttack.push([row + w, col + s])
                            //Выходим из цикла, иначе мы перепрыгнем фигуру
                            break
                        }
                        if (k === 0) {
                            if (q === 0) { w++; s++ }  else
                            if (q === 1) { w++      }
                        } else
                        if (k === 1) {
                            if (q === 0) { w++; s-- }  else
                            if (q === 1) { w--      }
                        } else
                        if (k === 2) {
                            if (q === 0) { w--; s++ }  else
                            if (q === 1) { s++      }
                        } else
                        if (k === 3) {
                            if (q === 0) { w--; s-- }  else
                            if (q === 1) { s--      }
                        }
                    }
                }
            }
            if (nameFigure === 'Bishop') {
                q = 2
            }
        }
        if (mod) {
            //Добавляем все возможные ходы
            storage.arrayPossibleMoves.set(name, arrMove)
        }
        possiblesMoves.attackMap(arrAttack, colorName, mod)
    }
}

const king = {
    castling: { //Рокировка
        blackKing$: true, //Если true - король не делал ходов
        whiteKing$: true,
        blackCastle1: true, //Аналогично для ладьи
        blackCastle2: true,
        whiteCastle1: true,
        whiteCastle2: true
    },
    possiblesMoves() {
/*  Возможные ходы для короля
    *   row+-   col+-
    *   row     col+-
    *   row+-   col         Всего 8
        *
        *   Так же король не может находится на соседней клетке с другим королем, по этому
        *   при каждом определении возможных ходов для короля, будем так же определять и
        *   возможные ходы для второго и если среди них есть совпадения - исключать
        *
        *   Рокировка. Перемещение row+-2 + смена положения ладьи на row-+ относительно короля
            *   Если король и ладья, в направлении которой делается рокировка, не делали ходов
                    *   сделать для этих фигур отдельные глобальные переменные со значением true -
                    *   по дефолту, если фигура делает ход - меняем значение на false
                    *   при определении ходов короля проверять эти значения
            *   Если королю не объявлен шах
            *   Если место, на которое встанет король не под боем
        *
        *   Кроме этого, король не может встать на клетку, по которой может ударить другая фигура
                *   Чтобы предусмотреть это нужна карта всех клеток, находящихся "под боем"
                        *   Генерировать её каждый раз при выборе короля как то не то
                            *   Стоит изначать создать такую карту и после каждого хода её обновлять
                            *   ***(что я и сделал на следующий день)
        *   И ещё ход фигуры-союзника может привести к шаху, значит при определении возможных ходов
        *   всех фигур нужно определять приведут ли они к шаху для своего короля
        *
        *   Шах. После каждого хода проверять есть ли по координатам нахождения короля
        *   совпадение с картой клеток "под боем" противоположной стороны
            *   Если есть - шах. Дальше непосредственно нужно прописывать правила, что делать
            *   если королю стоит шах
                *   Что-то вроде: после следующего хода проверять, если королю всё ещё шах, то ход не
                *   возможный
                *   Но лучше, определять все возможные ходы для предотвращения шаха ***(что я в последствии и сделал)
        *   Мат. Король под боем, как и в случае шаха, но ни у короля, ни у других союзных фигур нет
        *   возможных ходов
                *   Тут тоже в плюс идея определять все возможные ходы для предотвраения шаха, если их 0
                *   то мат
                * */

        let wK = 'whiteKing$'
        let bK = 'blackKing$'

        storage.arrayPossibleMoves.set (wK, [])
        storage.arrayPossibleMoves.set (bK, [])

        //Определяем местоположение королей (было бы разумней хранить положение фигур в ассоциативном массиве...)
        let wRow
        let bRow
        let wCol
        let bCol

        for (let r = 0; r < storage.arrayPositionFigure.length; r++) {
            for (let c = 0; c < storage.arrayPositionFigure[r].length; c++) {
                if (storage.arrayPositionFigure[r][c] === bK) {
                    bRow = r
                    bCol = c
                } else if (storage.arrayPositionFigure[r][c] === wK) {
                    wRow = r
                    wCol = c
                } else if (wRow !== undefined && bRow !== undefined) {
                    break
                }
            }
        }
        //Тут будем сохранять возможные ходы для королей
        let wArr = []
        let bArr = []

        //(это все возможные ходы без учета рядом стоящих фигур-союзников)
        for (let k = 0; k < 2; k++) {
            let r, c
            if (k === 0) { r = wRow; c = wCol } else { r = bRow; c = bCol }
            let arrPossible = [
                [r + 1, c + 1],
                [r + 1, c - 1],
                [r - 1, c + 1],
                [r - 1, c - 1],
                [r    , c + 1],
                [r    , c - 1],
                [r + 1, c    ],
                [r - 1, c    ]
            ]
            //Перебираем все варианты
            for (let i = 0; i < 8; i++) {
                let a = arrPossible[i][0]
                let b = arrPossible[i][1]
                //Если координаты входят в пределы игрового поля
                if (a <= 7 && a >= 0 && b <= 7 && b >= 0) {
                    //Пушим для соответствующего короля
                    if (k === 0) {
                        wArr.push([a, b, true, true])
                    } else {
                        bArr.push([a, b, true, true])
                    }
                }
            }
        }
        //Удаляем совпадающие координат
        for (let i = 0; i < wArr.length; i++) {
            let a = wArr[i].toString()
            for (let q = 0; q < bArr.length; q++) {
                let b = bArr[q].toString()
                if (a === b) {
                    wArr.splice(i, 1)
                    bArr.splice(q, 1)
                    i--
                    break
                }
            }
        }

        const freeTile = array => {
            for (let a of array) {
                if (storage.arrayPositionFigure[a[0]][a[1]]) {
                    return false
                }
            }
            return true
        }
        let color, k, c1, c2
        if (move.sideMove) {
            color = 1
            k = king.castling.whiteKing$
            c1 = king.castling.whiteCastle1
            c2 = king.castling.whiteCastle2
        } else {
            color = 0
            k = king.castling.blackKing$
            c1 = king.castling.blackCastle1
            c2 = king.castling.blackCastle2
        }
        //Перед рокировкой проверяем стоит ли королю шах
        this.$checkKing()
        //Рокировка
        //Первым делом определяем делали ли короли шах и стоит ли королю шах
        if (k && !this.checkStatus) {
            //Для каждой ладьи
            for (let z = 0, c = c1; z < 2; z++, c = c2) {
                // Если ладья не делала шаг
                if (c) {
                    let p, q, l
                    color? p = 7: p = 0;
                    (z === 0)? q = freeTile([[p, 1],[p, 2],[p, 3]]): q = freeTile([[p, 5],[p, 6]]);
                    (z === 0)? l = 2: l = 6
                    if (q) {
                        color? wArr.push([p, l, false, true]): bArr.push([p, l, false, true])
                    }
                }
            }
        }
        //Исключаем клетки, на которых стоят фигуры-союзники. Исключаем клетки находящиеся под боем
        for (let k = 0, c = 'w', s = wArr; k < 2; k++, c = 'b', s = bArr) {
            for (let i = 0; i < s.length; i++) {
                let a = storage.arrayPositionFigure[s[i][0]][s[i][1]].toString()
                if (a.charAt(0) === c) {
                    s.splice(i, 1)
                    i--
                } else {
                    if (storage.arrayAttack[s[i][0]][s[i][1]]) {
                        s.splice(i, 1)
                        i--
                    }
                }
            }
        }
        //Добавляем ходы
        move.sideMove? storage.arrayPossibleMoves.set(wK, wArr): storage.arrayPossibleMoves.set(bK, bArr)
    },
    checkStatus: false,//true - стоит шах
    //Определяем стоит ли шах
    $checkKing() {
        const arrayAttack = storage.arrayAttack
        //определяем местоположение королей
        for (let r = 0; r < storage.arrayPositionFigure.length; r++) {
            for (let c = 0; c < storage.arrayPositionFigure[r].length; c++) {
                let pos = storage.arrayPositionFigure[r][c]
                if (move.sideMove? pos === 'whiteKing$': pos === 'blackKing$') {
                    if (arrayAttack[r][c]) {
                        this.checkStatus = true
                        backlight.space(r, c, true, 'red')
                        backlight.historyPos.posKing = [r, c]
                        return
                    }
                }
                if (this.checkStatus && (!move.sideMove? pos === 'whiteKing$': pos === 'blackKing$')) {
                    this.checkStatus = false
                    backlight.space(r, c, false)
                }
            }
        }
        if (backlight.crutchForKing) {
            backlight.space(backlight.crutchForKing[0], backlight.crutchForKing[1], true, 'blue')
            backlight.crutchForKing = 0
        }
    }
}



const checkedMove = {   //Определяем шаги, которые приводят к шаху для своего короля/
    //Шаги, которые спасают от шаха
    /*
        *   Первым делом нужна копия массива положения фигур и эту копию нужно получать (перезаписывать) перед каждой
        *   проверкой очередного возможного хода
            *   Теперь, когда мы получили карту расположения всех фигур, к ней нужно применить поочередно каждый
            *   возможный ход нужной стороны и для измененной карты определить возможные ходы вражеской стороны
            *   Благо для этой цели можно переиспользовать уже созданные мной методы определения возможных ходов
            *   после внесения в них небольших корректировок (***mod)
                *   Теперь нужно проверить, если для текущего положения короля на этой карте есть угроза
                    *   перезаписать ход со 2-м флагом false
                *   Если нет, перезаписать с флагом true
            *   Когда заканчиваем этот процесс с одной фигурой, новые варианты ходов записываем в массив
            *   возможных ходов и переходим к следующей */

    arrayPositionFigure: [ [], [], [], [], [], [], [], [] ],
    arrayAttack: [ [], [], [], [], [], [], [], [] ],
    check() {
        let posKing
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (String(storage.arrayPositionFigure[r][c]).search(`${move.sideMove? 'whiteKing': 'blackKing'}`) !== -1) {
                    posKing = [r, c]
                    break
                }
            }
        }
        for (let a of storage.arrayPossibleMoves) {
            if (a[0].search('King') !== -1) {
                continue
            }
            let modifierMoveArr = []
            for (let i = 0; i < a[1].length; i++) {
                this.copy(this.arrayPositionFigure, storage.arrayPositionFigure)
                this.emulationMove (a[1][i][0], a[1][i][1], a[0])
                possiblesMoves.preparation(false)
                if (this.arrayAttack[posKing[0]][posKing[1]]) {
                    modifierMoveArr.push([a[1][i][0], a[1][i][1], a[1][i][2], false])
                } else {
                    modifierMoveArr.push([a[1][i][0], a[1][i][1], a[1][i][2], true])
                }
            }
            storage.arrayPossibleMoves.set(a[0], modifierMoveArr)
        }
        //Проверяем стоит ли королю мат (если все возможные ходы со вторым флагом false - мат)
        this.mate()
    },
    //Копируем многомерный массив
    copy(arrNew, arrOld) {
        for (let i = 0; i < 8; i++){
            for (let q = 0; q < 8; q++){
                arrNew[i][q] = arrOld[i][q]
            }
        }
    },
    emulationMove (row, col, name) {
        for (let r = 0; r < this.arrayPositionFigure.length; r++){
            for (let c = 0; c < this.arrayPositionFigure[r].length; c++) {
                if (this.arrayPositionFigure[r][c] === name) {
                    this.arrayPositionFigure[r][c] = 0
                    this.arrayPositionFigure[row][col] = name
                    return
                }
            }
        }
    },
    mate(){
        //Считаем количество возможных ходов
        let counter = 0
        for (let i of storage.arrayPossibleMoves) {
            //Исключаем ходы противоположной стороны
            if (move.sideMove? i[0].charAt(0) === 'w': i[0].charAt(0) === 'b') {
                if (i[1].length) {
                    for(let g of i[1]){
                        //Если ход возможен увеличиваем счётчик
                        if (g[3]) {
                            counter++
                        }
                    }
                }
            }
        }
        if (!counter && king.checkStatus) { //Если возможных ходов нет и королю шах
            menu.outputMessage(`#${move.counter}: ${
                move.sideMove? 'Королю белых шах и мат': 'Королю черных шах и мат'}`,
                'span-red')
        } else if (king.checkStatus) { //Если королю шах
            menu.outputMessage(`#${move.counter}: ${
                move.sideMove? 'Королю белых шах': 'Королю черных шах'}`,
                'span-red')
        } else if (!counter) {  //возможных ходов нет, шах не стоит. Пат
            menu.outputMessage(`#${move.counter}: Пат`, 'span-red')
        }
    }
}



const history = {
    shiftStatus: false,
    counterMax: -1,
    counter: 0,
    saves: {},
    save() {
        this.counterMax++
        this.saves[`save${move.counter}`] = {}
        this.saves[`save${move.counter}`]['sideMove'] = move.sideMove
        this.saves[`save${move.counter}`]['counter'] = move.counter
        this.saves[`save${move.counter}`]['checkStatus'] = king.checkStatus
        this.saves[`save${move.counter}`]['selectedFigure'] = move.selectedFigure
        this.saves[`save${move.counter}`]['historyPos'] = {}
        this.saves[`save${move.counter}`]['historyPos']['pos1'] = backlight.historyPos.pos1
        this.saves[`save${move.counter}`]['historyPos']['pos2'] = backlight.historyPos.pos2
        this.saves[`save${move.counter}`]['historyPos']['posKing'] = backlight.historyPos.posKing
        this.saves[`save${move.counter}`]['outputMessageArr'] = menu.outputMessageArr.slice()
        this.saves[`save${move.counter}`]['castling'] = {}
        this.saves[`save${move.counter}`]['castling']['blackKing$'] = king.castling.blackKing$
        this.saves[`save${move.counter}`]['castling']['whiteKing$'] = king.castling.whiteKing$
        this.saves[`save${move.counter}`]['castling']['blackCastle1'] = king.castling.blackCastle1
        this.saves[`save${move.counter}`]['castling']['blackCastle2'] = king.castling.blackCastle2
        this.saves[`save${move.counter}`]['castling']['whiteCastle1'] = king.castling.whiteCastle1
        this.saves[`save${move.counter}`]['castling']['whiteCastle2'] = king.castling.whiteCastle2
        let a = [[], [], [], [], [], [], [], []]
        checkedMove.copy(a, storage.arrayPositionFigure)
        this.saves[`save${move.counter}`]['arrayPositionFigure'] = a
        let b = []
        for (let n of storage.arrayPossibleMoves.keys()){
            b.push(n)
        }
        this.saves[`save${move.counter}`]['arrayPossibleMoves'] = b
        this.counter = this.counterMax
        if (this.counter === 1) {
            document.querySelector('#back').removeAttribute('disabled')
        }
        document.querySelector('#forward').setAttribute('disabled', 'disabled')
        localStorage.setItem(`save${move.counter}`, JSON.stringify(this.saves[`save${move.counter}`]))
    },
    back() {
        this.shiftStatus = true
        document.querySelector('#forward').removeAttribute('disabled')
        if (this.counter <= 1) {
            document.querySelector('#back').setAttribute('disabled', 'disabled')
        } else {
            document.querySelector('#back').removeAttribute('disabled')
        }
        if (this.counter > 0) {
            this.counter--
            this.replace(this.counter)
            backlight.clear()
            backlight.checking()
        }
    },
    forward() {
        this.shiftStatus = true
        this.counter += 1
        document.querySelector('#back').removeAttribute('disabled')
        if (this.counter === this.counterMax) {
            document.querySelector('#forward').setAttribute('disabled', 'disabled')
        } else {
            document.querySelector('#forward').removeAttribute('disabled')
        }
        if (this.counter <= this.counterMax) {
            this.replace(this.counter)
            backlight.clear()
            backlight.checking()
        }
    },
    replace(counter) {
        let a  = this.saves[`save${counter}`]
        move.sideMove = a.sideMove
        move.counter = a.counter
        king.checkStatus = a.checkStatus
        move.selectedFigure = a.selectedFigure
        backlight.historyPos.pos1 = a.historyPos.pos1
        backlight.historyPos.pos2 = a.historyPos.pos2
        backlight.historyPos.posKing = a.historyPos.posKing
        storage.arrayPositionFigure = a.arrayPositionFigure
        king.castling.blackKing$ = a.castling.blackKing$
        king.castling.whiteKing$ = a.castling.whiteKing$
        king.castling.blackCastle1 = a.castling.blackCastle1
        king.castling.blackCastle2 = a.castling.blackCastle2
        king.castling.whiteCastle1 = a.castling.whiteCastle1
        king.castling.whiteCastle2 = a.castling.whiteCastle2
        storage.arrayPossibleMoves = new Map ()
        for (let n of a.arrayPossibleMoves) {
            storage.arrayPossibleMoves.set(n, [])
        }
        menu.outputMessageArr = a.outputMessageArr.slice()
        this.render()
    },
    render() {
        for (let r = 0; r < 8; r++) {
            for (let c= 0; c < 8; c++) {
                storage.arraySpace[r][c].innerHTML = ''
                if (storage.arrayPositionFigure[r][c]) {
                    let b = storage.arrayPositionFigure[r][c].split('')
                    b.pop()
                    b = b.join('')
                    storage.arraySpace[r][c].innerHTML = storage.arrayFigureIcon.get(b)
                }
            }
        }
        menu.clearMessage()
        menu.resetMessage()
        possiblesMoves.preparation(true)
    },
    clear() {
        for (let i = move.counter + 1; i <= this.counterMax; i++) {
            delete this.saves[`save${i}`]
            localStorage.removeItem(`save${i}`)
        }
        // menu.outputMessageArr = []
        this.counterMax = move.counter - 1
    },
    recovery() {
        if (localStorage.length > 1) {
            for (let a = 0; a < localStorage.length; a++) {
                let b = JSON.parse(localStorage.getItem(`save${a}`))
                this.saves[`save${a}`] = {}
                this.saves[`save${a}`] = b
            }
            generate.generateBoard(false)
            this.counterMax = localStorage.length - 2
            this.replace(this.counterMax + 1)
            backlight.checking()
            document.querySelector('#continue').removeAttribute('disabled')
            document.querySelector('#back').removeAttribute('disabled')
        }
    }
}
history.recovery()
