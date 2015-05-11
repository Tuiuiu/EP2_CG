

var program;
var canvas;
var gl;

var numVertices  = 36;

var pointsArray = [];           
var normalsArray = [];          

var flatArray = [];             // Arrays auxiliares para salvarmos o valor das normais e as utilizar quando formos
var argumentArray = [];         // passar de uma técnica de shading para a outra (em tempo de execução)
var smooth2Array = [];

var functionWasCalled = 0;      // Verifica se já rodamos a função loadObjFile
var hasNormalsFromFile;

var objectsArray = [];
var selectedObject = 1;

var centroid;                   // Algumas variáveis que recebem valores de loabObjFile
var diameter = 2;               

var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5, -0.5, -0.5, 1.0 )
    ];

var lightPosition = vec4( 10.0, 10.0, 10.0, 0.0 );
var lightAmbient = vec4( 0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

// transformation and projection matrices
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

//var ctm;
var ambientColor, diffuseColor, specularColor;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 1;
var theta =[0, 0, 0];

var thetaLoc;

// camera definitions
var eye = vec3(1.0, 0.0, 0.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var cradius = 1.0;
var ctheta = 0.0;
var cphi = 0.0;

// our universe
var xleft = -1.0;
var xright = 1.0;
var ybottom = -1.0;
var ytop = 1.0;
var znear = -100.0;
var zfar = 100.0;

var flag = true;

// generate a quadrilateral with triangles
function quad(a, b, c, d) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = vec4(cross(t1, t2), 0);

     pointsArray.push(vertices[a]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[b]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[c]); 
     normalsArray.push(normal);   
     pointsArray.push(vertices[a]);  
     normalsArray.push(normal); 
     pointsArray.push(vertices[c]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[d]); 
     normalsArray.push(normal);    
}

// define faces of a cube
function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // create viewport and clear color
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );
    
    // enable depth testing for hidden surface removal
    gl.enable(gl.DEPTH_TEST);

    //  load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // draw simple cube for starters
    //colorCube();

    // create vertex and normal buffers
    //createBuffers();

    thetaLoc = gl.getUniformLocation(program, "theta"); 

    // create light components
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    // create model view and projection matrices
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};
    document.getElementById("ButtonFlat").onclick = function(){ if (functionWasCalled) { normalsArray = flatArray; createBuffers(); } };
    document.getElementById("ButtonSmooth1").onclick = function(){ if (functionWasCalled) { normalsArray = argumentArray; createBuffers(); } };
    document.getElementById("ButtonSmooth2").onclick = function(){ if (functionWasCalled) { normalsArray = smooth2Array; createBuffers(); } };

    document.getElementById('files').onchange = function (evt) {
        var data;
        var file = evt.target.files[0];         // Seleciona o arquivo recebido pelo botão "Browse"

        if(!file) {                             // Se o arquivo não é válido ou não foi carregado
            alert("Failed to load the file!");
        } else {                                // Se o arquivo for valido
            var reader = new FileReader();      // Cria uma nova instância de FileReader 
            reader.onload = function (evt) {    // Quando o arquivo estiver completamente carregado
                data = evt.target.result;       // 'data' armazenará o conteúdo da entrada 
                loadObject(data, objectsArray);
                render();
            //  createBuffers();
            }
            reader.readAsText(file); 
        }
    };

    document.addEventListener("keydown", handleOptions(event));

    function handleOptions(event) {
        switch(event.keyCode) {
            case: 88 
                deleteSelectedObject();
                break;
            case:             

        }

    }




    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
       flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
       flatten(lightPosition) );
       
    gl.uniform1f(gl.getUniformLocation(program, 
       "shininess"),materialShininess);
    
    render();
}

var render = function() {
            
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
    var wrapper = document.getElementById("gl-wrapper");           
    var fixRatio = wrapper.clientHeight/wrapper.clientWidth;

    if (flag) theta[axis] += 2.0;
            
    eye = vec3(cradius * Math.sin(ctheta) * Math.cos(cphi),
               cradius * Math.sin(ctheta) * Math.sin(cphi), 
               cradius * Math.cos(ctheta));

    modelViewMatrix = lookAt(eye, at, up);
              
    modelViewMatrix = mult(modelViewMatrix, scale(vec3(fixRatio,1,1)));
    
//  modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], [1, 0, 0] ));
//  modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], [0, 1, 0] ));
//  modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], [0, 0, 1] ));
    

/*    if(functionWasCalled) {

        var scl = scale(vec3(2/diameter, 2/diameter, 2/diameter));      // Ajustamos o tamanho do objeto para caber no Canvas
        modelViewMatrix = mult(modelViewMatrix, scl);

        var trans = translate(-centroid[0],-centroid[1],-centroid[2]);  // Centralizamos o objeto no Canvas
        modelViewMatrix = mult(modelViewMatrix, trans);    
    } */

    projectionMatrix = ortho(xleft, xright, ybottom, ytop, znear, zfar);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    for(var i = 0; i < objectsArray.length; i++){
        if ( i != selectedObject ){
            objectsArray[i].createObjBuffers();
            objectsArray[i].drawArrays();
        }
        else {
            materialDiffuse   = vec4( 0.0, 1.0, 0.8, 1.0 );
            materialSpecular  = vec4( 0.0, 1.0, 0.8, 1.0 );
            diffuseProduct = mult(lightDiffuse, materialDiffuse);
            specularProduct = mult(lightSpecular, materialSpecular);
            gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
            gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );

            objectsArray[i].createObjBuffers();
            objectsArray[i].drawArrays();

            
            materialDiffuse   = vec4( 1.0, 0.8, 0.0, 1.0 );
            materialSpecular  = vec4( 1.0, 0.8, 0.0, 1.0 );
            diffuseProduct = mult(lightDiffuse, materialDiffuse);
            specularProduct = mult(lightSpecular, materialSpecular);
            gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
            gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );

        }
    }
            
    requestAnimFrame(render);
}

function createBuffers(points, normals) {

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

}

function loadObject(data, objects) {
    var parsedObject;
    var result = loadObjFile(data);         // Chamamos a função loadObjFile (que parseará a entrada) e salvamos seu resultado em 
    functionWasCalled = 1;                  // algumas variáveis globais que usaremos para as operações.
    pointsArray = result[0];
    smooth2Array = result[2];
    centroid = result[3];
    diameter = result[4];
    flatArray = result[5];
    if (result[6]) argumentArray = result[1];
    else argumentArray = flatArray;

    normalsArray = argumentArray;

    var trans = translate(-centroid[0],-centroid[1],-centroid[2]);  // Centralizamos o objeto no Canvas
    
    for (var i = 0; i < pointsArray.length; i++){
        pointsArray[i] = multVecMatrix( pointsArray[i], trans );
    }
    
    parsedObject = new Object(pointsArray, flatArray, smooth2Array);
    objects.push(parsedObject);
}



function multVecMatrix( vector, matrix ){
    var result = vec4(0,0,0,0);
    var partialSum;

    for (var i = 0; i < matrix.length; i++){
        partialSum = 0;
        for (var j = 0; j < vector.length; j++){
            partialSum = partialSum + vector[j]*matrix[i][j];
        }
        result[i] = partialSum;
    }
    return result;
}