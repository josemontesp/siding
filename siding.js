var cheerio = require('cheerio');
var request = require('request');

var constantes = {
    loginUrl: 'https://intrawww.ing.puc.cl/siding/index.phtml',
    usuario: 'jemontes',
    clave: 'xxxxxxx'
};

// Inicia sesión en Siding usando las credenciales en la variable constantes.
// Retorna una Promesa con la cookie de la sesión
function sidingLogin() {
    var cookieJar = request.jar();
    return new Promise(function(resolve, reject) {
        request.post({
            url: constantes.loginUrl,
            jar: cookieJar
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(cookieJar);
            } else {
                reject({
                    error: error,
                    response: response,
                    body: body
                });
            }
        }).form({
            login: constantes.usuario,
            passwd: constantes.clave,
            sw: '',
            sh: '',
            cd: ''
        });
    });
}

//Recibe la cookie de la sesion generada por sidingLogin.
//Retorna una Promesa con arreglo de cursos.
function getCursos(sessionCookie) {
    var url = 'https://intrawww.ing.puc.cl/siding/dirdes/ingcursos/cursos/index.phtml?per_lista_cursos=21_2016&acc_inicio=mis_cursos';
    return new Promise(function(resolve, reject) {
        request({
            url: url,
            jar: sessionCookie
        }, function(error, response, body) {
            $ = cheerio.load(body, {
                normalizeWhitespace: true
            });
            var cursos = [];
            $('tr', 'table[style="width:100%; border-spacing: 0px; vertical-align: top"]').next().next().each(function(e) {
                var curso = {
                    nombre: $(this).text().trim()
                    
                };
                if ($(this).html().indexOf('</a>') != -1) {
                    curso.id = cheerio.load($(this).children().html())('a').attr('href').split('=')[3];
                }
                cursos.push(curso);
            });
            resolve(cursos);
        })
    });
}

function getAvisosCurso(sessionCookie, idCurso){

}

sidingLogin().then(function(c) {
    //console.log(c);
    return getCursos(c);
}).then(function(c){
    console.log(c);
})