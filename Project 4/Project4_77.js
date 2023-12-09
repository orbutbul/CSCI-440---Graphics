"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;
var instanceMatrix;

var modelViewMatrixLoc;

var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];

var lightPosition = vec4(-10, 0, 0, 0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 3.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 1., 1.0, 1.0);
var materialSpecular = vec4(1.0, 1., 1.0, 1.0);
var materialShininess = 100.3;

var normalMatrix, normalMatrixLoc;

var ambientProduct, ambientProductLoc;
var diffuseProduct, diffuseProductLoc;
var specularProduct, specularProductLoc;
var lightPositionLoc;
var shininessLoc;


var cat1WalkForward = false;
var y = 0;
var cat1WalkBackward = false;


var maxDist = 2;

var cat2SwayTail = false;
var x = 0;
var cat2TailPos = 0;

var cat2Jump = false;
var jump = 0;
var jumping = 0;


//  CAT 1
var torsoId = 0;
var headId = 1;
var head1Id = 1;
var head2Id = 10;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;
var tailId = 11;

// CAT 2
var torsoId2 = 12;
var headId2 = 13;
var head1Id2 = 13;
var head2Id2 = 22;
var leftLowerArmId2 = 14;
var leftUpperArmId2 = 15;
var rightUpperArmId2 = 16;
var rightLowerArmId2 = 17;
var leftUpperLegId2 = 18;
var leftLowerLegId2 = 19;
var rightUpperLegId2 = 20;
var rightLowerLegId2 = 21;
var tailId2 = 23;

var torsoHeight = 5.0;
var torsoWidth = 2.0;

var upperArmWidth = 0.5;
var lowerArmWidth = 0.5;
var lowerArmHeight = 1.5;
var upperArmHeight = 1.5;

var upperLegWidth = 0.5;
var lowerLegWidth = 0.5;
var lowerLegHeight = 1.5;
var upperLegHeight = 1.5;

var headHeight = 1.5;
var headWidth = 1.0;

var numNodes = 24;
var numAngles = 11;

var thetaCat1 = [45, 90, 90, 0, 90, 0, 90, 0, 90, 0, 0, 0,
                 -45, 90, 90, 0, 90, 0, 90, 0, 90, 0, 0, 0];


var stack = [];
var figure = [];

for (var i = 0; i < numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;

var pointsArray = [];
var normalsArray = [];


//-------------------------------------------

function scale4(a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}

//--------------------------------------------

function createNode(transform, render, sibling, child) {
    var node = {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child,
    }
    return node;
}

function initNodes(Id) {

    var m = mat4();

    switch (Id) {

        case torsoId:
            m = translate(-9, 0, -2)
            m = mult(m, rotate(thetaCat1[torsoId], 0, 1, 0));
            m = mult(m, rotateX(90));
            figure[torsoId] = createNode(m, torso, null, headId);
            break;
        case headId:
        case head1Id:
        case head2Id:
            m = translate(0., torsoHeight + -.3 * headHeight, -torsoWidth * .8);
            m = mult(m, rotate(thetaCat1[head1Id], 1, 0, 0))
            m = mult(m, rotate(thetaCat1[head2Id], 0, 1, 0));
            m = mult(m, translate(0.0, -0.5 * headHeight, 0.0));
            figure[headId] = createNode(m, head, leftUpperArmId, null);
            break;
        case leftUpperArmId:
            m = translate(-(torsoWidth + upperArmWidth) / 3, torsoHeight - .3, 0.9);
            m = mult(m, rotate(thetaCat1[leftUpperArmId], 1, 0, 0));
            figure[leftUpperArmId] = createNode(m, leftUpperArm, rightUpperArmId, leftLowerArmId);
            break;
        case rightUpperArmId:
            // 
            m = translate((torsoWidth + upperArmWidth) / 3, torsoHeight - .3, .9);
            m = mult(m, rotate(thetaCat1[rightUpperArmId], 1, 0, 0));
            figure[rightUpperArmId] = createNode(m, rightUpperArm, leftUpperLegId, rightLowerArmId);
            break;
        case leftUpperLegId:
            m = translate((torsoWidth + upperLegWidth) / 3, 0.1 * upperLegHeight, .9);
            m = mult(m, rotate(thetaCat1[leftUpperLegId], 1, 0, 0));
            figure[leftUpperLegId] = createNode(m, leftUpperLeg, rightUpperLegId, leftLowerLegId);
            break;
        case rightUpperLegId:
            m = translate((-torsoWidth + upperLegWidth) / 2, 0.1 * upperLegHeight, .9);
            m = mult(m, rotate(thetaCat1[rightUpperLegId], 1, 0, 0));
            figure[rightUpperLegId] = createNode(m, rightUpperLeg, tailId, rightLowerLegId);
            break;
        case leftLowerArmId:
            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(thetaCat1[leftLowerArmId], 1, 0, 0));
            figure[leftLowerArmId] = createNode(m, leftLowerArm, null, null);
            break;
        case rightLowerArmId:
            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(thetaCat1[rightLowerArmId], 1, 0, 0));
            figure[rightLowerArmId] = createNode(m, rightLowerArm, null, null);
            break;
        case leftLowerLegId:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(thetaCat1[leftLowerLegId], 1, 0, 0));
            figure[leftLowerLegId] = createNode(m, leftLowerLeg, null, null);
            break;
        case rightLowerLegId:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(thetaCat1[rightLowerLegId], 1, 0, 0));
            figure[rightLowerLegId] = createNode(m, rightLowerLeg, null, null);
        case tailId:
            m = translate(torsoWidth / 2, -torsoHeight / 2, -torsoWidth / 2);
            m = mult(m, rotate(thetaCat1[tailId], 1, 0, 0));
            figure[tailId] = createNode(m, tail, null, null);
            break;
    }
}

//----------------------------------------------------------------------------

function initNodes2(Id) {

    var m = mat4();

    switch (Id) {
        case torsoId2:
            m = translate(9, 0, -2)
            m = rotate(thetaCat1[torsoId2], 0, 1, 0);
            m = mult(m, rotateX(90));
            figure[torsoId2] = createNode(m, torso, null, headId);
            break;
        case headId2:
        case head1Id2:
        case head2Id2:
            m = translate(0., torsoHeight + -.3 * headHeight, -torsoWidth * .8);
            m = mult(m, rotate(thetaCat1[head1Id2], 1, 0, 0))
            m = mult(m, rotate(thetaCat1[head2Id2], 0, 1, 0));
            m = mult(m, translate(0.0, -0.5 * headHeight, 0.0));
            figure[headId2] = createNode(m, head, leftUpperArmId2, null);
            break;
        case leftUpperArmId2:
            m = translate(-(torsoWidth + upperArmWidth) / 3, torsoHeight - .3, 0.9);
            m = mult(m, rotate(thetaCat1[leftUpperArmId2], 1, 0, 0));
            figure[leftUpperArmId2] = createNode(m, leftUpperArm, rightUpperArmId2, leftLowerArmId2);
            break;
        case rightUpperArmId2:
            // 
            m = translate((torsoWidth + upperArmWidth) / 3, torsoHeight - .3, .9);
            m = mult(m, rotate(thetaCat1[rightUpperArmId2], 1, 0, 0));
            figure[rightUpperArmId2] = createNode(m, rightUpperArm, leftUpperLegId2, rightLowerArmId2);
            break;
        case leftUpperLegId2:
            m = translate((torsoWidth + upperLegWidth) / 3, 0.1 * upperLegHeight, .9);
            m = mult(m, rotate(thetaCat1[leftUpperLegId2], 1, 0, 0));
            figure[leftUpperLegId2] = createNode(m, leftUpperLeg, rightUpperLegId2, leftLowerLegId2);
            break;
        case rightUpperLegId2:
            m = translate((-torsoWidth + upperLegWidth) / 2, 0.1 * upperLegHeight, .9);
            m = mult(m, rotate(thetaCat1[rightUpperLegId2], 1, 0, 0));
            figure[rightUpperLegId2] = createNode(m, rightUpperLeg, tailId2, rightLowerLegId);
            break;
        case leftLowerArmId2:
            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(thetaCat1[leftLowerArmId2], 1, 0, 0));
            figure[leftLowerArmId2] = createNode(m, leftLowerArm, null, null);
            break;
        case rightLowerArmId2:
            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(thetaCat1[rightLowerArmId2], 1, 0, 0));
            figure[rightLowerArmId2] = createNode(m, rightLowerArm, null, null);
            break;
        case leftLowerLegId2:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(thetaCat1[leftLowerLegId2], 1, 0, 0));
            figure[leftLowerLegId2] = createNode(m, leftLowerLeg, null, null);
            break;
        case rightLowerLegId2:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(thetaCat1[rightLowerLegId2], 1, 0, 0));
            figure[rightLowerLegId2] = createNode(m, rightLowerLeg, null, null);
        case tailId2:
            m = translate(torsoWidth / 2, -torsoHeight / 2, -torsoWidth / 2);
            m = mult(m, rotate(thetaCat1[tailId2], 1, 0, 0));
            figure[tailId2] = createNode(m, tail2, null, null);
            break;
    }
}

function traverse(Id) {
    // if null, leave (exit condition)
    if (Id == null) return;
    // Push MVM into stack array, whe
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
    figure[Id].render();
    // if child then sibling exists, traverse to that one (preserve tree structure)
    // remove MVM from the stack when back to base traverse id
    if (figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
    if (figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function torso() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * torsoHeight, 0.0));
    
    instanceMatrix = mult(instanceMatrix, scale4(torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    instanceMatrix = mult(modelViewMatrix, translate(y, 0.5 * torsoHeight, 0.0));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}
function torso2() {
    instanceMatrix = mult(modelViewMatrix, translate(2.0, 0.5 * torsoHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function head() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftUpperArm() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftLowerArm() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperArm() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLowerArm() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftUpperLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftLowerLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLowerLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}
function tail() {
    instanceMatrix = mult(modelViewMatrix, translate(-.5 * torsoWidth, 2 * upperLegHeight, 0.0));

    instanceMatrix = mult(instanceMatrix, rotateX(-90));
    instanceMatrix = mult(instanceMatrix, rotateZ(cat2TailPos));
    instanceMatrix = mult(instanceMatrix, translate(0, upperLegHeight / 2, 0))


    instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}function tail2() {
    instanceMatrix = mult(modelViewMatrix, translate(-.5 * torsoWidth, 2 * upperLegHeight, 0.0));

    instanceMatrix = mult(instanceMatrix, rotateX(-90));
    instanceMatrix = mult(instanceMatrix, rotateZ(cat2TailPos));
    instanceMatrix = mult(instanceMatrix, translate(0, upperLegHeight / 2, 0))


    instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function quad(a, b, c, d) {
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);

    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    pointsArray.push(vertices[b]);
    normalsArray.push(normal);
    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    pointsArray.push(vertices[d]);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);

}

function cube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    //  Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-10.0, 10.0, -10.0, 10.0, -10.0, 100.0);
    modelViewMatrix = mat4();

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    cube();

    vBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");

    ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
    diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    specularProductLoc = gl.getUniformLocation(program, "specularProduct");
    lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
    shininessLoc = gl.getUniformLocation(program, "shininess");




    // initialize all nodes
    for (i = 0; i < numNodes; i++) initNodes(i);
    for (i = 0; i < numNodes; i++) initNodes2(i);



    document.getElementById("WalkF").onclick = function () {
        cat1WalkForward = !cat1WalkForward;
        cat1WalkBackward = false;
    };
    document.getElementById("WalkB").onclick = function () {
        cat1WalkBackward = !cat1WalkBackward;
        cat1WalkForward = false;
    };
    document.getElementById("Sway").onclick = function () {
        cat2SwayTail = !cat2SwayTail;
    };
    document.getElementById("Jump").onclick = function () {
        cat2Jump = !cat2Jump;
    };
    document.getElementById("Reset").onclick = function () {
        cat1WalkBackward = false;
        cat1WalkForward = false;
        cat2SwayTail = false;
        cat2Jump = false;
        x = 0;
        jump = 0;
        jumping = 0;
        cat2TailPos = 0;
        maxDist = 2;
        modelViewMatrix = mat4();
    };

    render();
}

var render = function () {




    gl.clear(gl.COLOR_BUFFER_BIT);

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);


    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));

    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));
    gl.uniform4fv(lightPositionLoc, flatten(lightPosition));
    gl.uniform1f(shininessLoc, materialShininess);


    if (cat2SwayTail) {
        x += .04;
        cat2TailPos = Math.sin(x) * 90;

    }
    if (cat1WalkForward) {
        maxDist += y;
        if (maxDist > 15) {
            y = 0;
        } else {
            y = .1;
            modelViewMatrix = mult(modelViewMatrix, translate(y, 0, 0));
            

        }
    }
    if (cat1WalkBackward) {
        maxDist += y;
        if (maxDist < 2.5) {
            y = 0;
        } else {
            y = -.1;
            modelViewMatrix = mult(modelViewMatrix, translate(y, 0, 0));

        }
    }


    if (cat2Jump) {
        jump += .05;
        jumping = Math.sin(jump);
        modelViewMatrix = mult(modelViewMatrix, translate(0, jumping / 6, 0));
    }
    if (cat2Jump == false && jumping != 0) {
        jump = 0;
        modelViewMatrix[1][3] *= .92;
    }
    traverse(torsoId);

    
    traverse(torsoId2);


    // I Couldnt get the other cat to show up at all, Ive tried for the past couple hours to find a solution but nothing seems to work so I just modified the code to 


    requestAnimFrame(render);
}
