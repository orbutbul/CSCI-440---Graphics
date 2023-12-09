var gl;

var theta = 0.0;
var thetaLoc;

var state = 0.0;
var stateLoc;

var delay = 1;
var direction = true;
var pause = true;
var color = vec4();



window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    // Four Vertices
    var vertices = [
        //vec2 holds the x and y coordinates
        vec2(-0.5, -0.5),
        vec2(-0.5, 0.5),
        vec2(0.5, 0.5),
        vec2(0.5, -0.5)
    ];
    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaLoc = gl.getUniformLocation(program, "theta");
    stateLoc = gl.getUniformLocation(program, "state");


    document.getElementById("Controls").onclick = function (event) {
        switch (event.target.index) {
            case 0://stop
                pause = true;
                break;
            case 1://slow
                var color = vec4(0.0, 1.0, 0.0, 1.0);
                pause = false;
                direction = true;
                break;//go
            case 2:
                pause = false;
                color = vec4(0.0, 0.0, 1.0, 1.0);
                direction = false;
        }
    };
    // color declaration
    colorLoc = gl.getUniformLocation(program, "color"); // in init
    gl.uniform4fv(colorLoc, flatten(color));


    render();
};


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (pause) {//stop
        state = 0.0;
        color = vec4(1.0, 0.0, 0.0, 1.0);
        theta = 0;
    } else {//slow
        if (direction) {
            state =1.0;
            color = vec4(1.0, 1.0, 0.0, 1.0);
            theta += .02;

        } else {//go
            state=2.0;
            color = vec4(0.0, 1.0, 0.0, 1.0);
            theta -= .04;

        }
    }

    gl.uniform1f(thetaLoc, theta);
    gl.uniform1f(stateLoc, state);
    gl.uniform4fv(colorLoc, flatten(color));


    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    setTimeout(
        function () { requestAnimFrame(render); }, delay
    );
}
