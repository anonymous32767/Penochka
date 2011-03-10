(function (pnck) {

    function formPostProcess(translations, addFields) {
        function addInput(obj, k, v) {
            var inp = document.createElement('INPUT')
            inp.setAttribute('type', 'hidden')
            inp.setAttribute('name', k)
            inp.setAttribute('value', v)
            obj.appendChild(inp)
        }

        return function (form, message) {
            for (t in addFields) {
                addInput(form, t, addFields[t])
            }
            for (t in message) {
                if (translations[t]) {
                    addInput(form, translations[t], message[t])
                } else {
                    addInput(form, t, message[t])
                }
            }
        }
    }

    var boardInfo = {
        '0chan.ru': {
            engine: 'kusaba',
            form: {
                action:  'http://' + location.host + '/board.php?dir=' + location.pathname.split('/')[1],
                messageData: '',
                attach: 'imagefile',
                postProcess: formPostProcess({
                    'message': 'message',
                    'title':'subject',
                    'password': 'postpassword',
                    'go2': 'gotothread',
                    'parent': 'replythread',
                }, {
                    'board': location.pathname.split('/')[1],
                    'MAX_FILE_SIZE': 2048000
                }),
                captchaImage: function () { return 'http://www.0chan.ru/captcha.php?' + Math.random() },
            }
        },
        'iichan.ru': {
            engine: 'wakaba',
            form: {
                action:  '/cgi-bin/wakaba.pl/' + location.pathname.split('/')[1] + '/',
                messageData: '',
                attach: 'file',
                captchaImage: function () {
                    var board = location.pathname.split('/')[1]
                    var  m = location.pathname.match(/\/res\/(\d+)/)
                    return '/cgi-bin/' + (board == 'b' ? 'captcha1.pl' : 'captcha.pl') + '/' +
                        location.pathname.split('/')[1] + '/?key=' +
                        (m ? 'res'+m[1] : 'mainpage' ) +'&amp;dummy='
                },
                postProcess: formPostProcess({
                    'name':'nya1',
                    'email': 'nya1',
                    'title': 'nya3',
                    'message': 'nya4',
                    'password': 'password',
                    'go2': 'postredir'
                }, {
                    'task': 'post',
                })
            }
        },
        'dobrochan.ru': {
            engine: 'hanabira',
            form: { /* Adjust this to match dobrochan */
                action:  '/' + location.pathname.split('/')[1] + '/post/new.xhtml',
                messageData: '',
                attach: 'file_1',
                captchaImage: function () {
                    return '/captcha/' + location.pathname.split('/')[1] + '/1.png'
                },
                postProcess: formPostProcess({
                    'title': 'subject',
                    'password': 'password',
                    'go2': 'goto',
                    'parent': 'thread_id'
                }, {
                    'task': 'post',
                    'post_files_count': '1'
                })
            }
        },
        '2-ch.ru': {
            sameas: 'iichan.ru',
            postProcess: formPostProcess({
                'name':'akane',
                'email': 'nabiki',
                'title': 'kasumi',
                'message': 'shampoo',
                'password': 'password',
                'go2': 'postredir',
		'captcha': 'recaptcha_response_field'
            }, {
                'task': 'post',
            })
        }
    }

    async_on('detect-board', function (board, ret) {
        var binfo = {sameas: board.host}
        while (binfo.sameas) {
            var origin = binfo.sameas
            delete binfo.sameas
            for (i in boardInfo[origin]) {
                if (!board[i])
                    board[i] = boardInfo[origin][i]
                binfo[i] = boardInfo[origin][i]
            }
        }
        if(!board) {
            console.log('Unknown location '+hostname+'. Exit.')
        }
        console.log(board)
        ret(board)
    })

})();