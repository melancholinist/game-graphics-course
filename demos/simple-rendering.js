// *********************************************************************************************************************
// **                                                                                                                 **
// **                  This is an example of simplistic forward rendering technique using WebGL                       **
// **                                                                                                                 **
// *********************************************************************************************************************

// Home task: change anything you like in this small demo, be creative and make it look cool ;)
// * You can change 3D cube model with any other mesh using Blender WebGL export addon, check blender/export_webgl.py
// * Change object and camera transformations inside draw() function
// * Change colors using bgColor and fgColor variables
// * Distort object shape inside vertexShader
// * Distort object colors inside fragmentShader

// ******************************************************
// **                       Data                       **
// ******************************************************

let positions = new Float32Array([
     0.0000,0.0000,-1.0000,0.7236,-0.5257,-0.4472,-0.2764,-0.8506,-0.4472,-0.8944,0.0000,-0.4472,-0.2764,0.8506,-0.4472,0.7236,0.5257,-0.4472,0.2764,-0.8506,0.4472,-0.7236,-0.5257,0.4472,-0.7236,0.5257,0.4472,0.2764,0.8506,0.4472,0.8944,0.0000,0.4472,0.0000,0.0000,1.0000
]);

let normals = new Float32Array([
    // front
    0.0000,0.0000,-1.0000,0.7236,-0.5257,-0.4472,-0.2764,-0.8506,-0.4472,-0.8944,0.0000,-0.4472,-0.2764,0.8506,-0.4472,0.7236,0.5257,-0.4472,0.2764,-0.8506,0.4472,-0.7236,-0.5257,0.4472,-0.7236,0.5257,0.4472,0.2764,0.8506,0.4472,0.8944,0.0000,0.4472,0.0000,0.0000,1.0000
]);

let triangles = new Uint16Array([
    // front
  0,1,2,1,0,5,0,2,3,0,3,4,0,4,5,1,5,10,2,1,6,3,2,7,4,3,8,5,4,9,1,10,6,2,6,7,3,7,8,4,8,9,5,9,10,6,10,11,7,6,11,8,7,11,9,8,11,10,9,11
]);


// ******************************************************
// **                 Pixel processing                 **
// ******************************************************

// language=GLSL
let fragmentShader = `
    #version 300 es
    precision highp float;
    in vec4 color;
    out vec4 outColor;
    void main()
    {
        outColor = color;
    }
`;


// ******************************************************
// **               Geometry processing                **
// ******************************************************

// language=GLSL
let vertexShader = `
    #version 300 es
    uniform vec4 bgColor;
    uniform vec4 fgColor;
    uniform mat4 modelViewMatrix;
    uniform mat4 modelViewProjectionMatrix;
    uniform float time;
    layout(location=0) in vec3 position;
    layout(location=1) in vec3 normal;
    out vec4 color;
    void main()
    {
      vec3 p = position;
        if (abs(p.x) > 0.80) p *= (sin(time));
        gl_Position = modelViewProjectionMatrix * vec4(p, 2.0);
        vec3 viewNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;
        color = mix(bgColor * 0.8, fgColor, viewNormal.z) + pow(viewNormal.z, 10.0);
    }
`;


// ******************************************************
// **             Application processing               **
// ******************************************************

let bgColor = vec4.fromValues(1.0, 0.2, 0.3, 1.0);
let fgColor = vec4.fromValues(3.0, 6.0, 9.0, 12.0);


app.clearColor(bgColor[1], bgColor[4], bgColor[6], bgColor[4])
    // .depthTest();
    .cullBackfaces();

let program = app.createProgram(vertexShader.trim(), fragmentShader.trim());

let vertexArray = app.createVertexArray()
    .vertexAttributeBuffer(0, app.createVertexBuffer(PicoGL.FLOAT, 3, positions))
    .vertexAttributeBuffer(1, app.createVertexBuffer(PicoGL.FLOAT, 3, normals))
    .indexBuffer(app.createIndexBuffer(PicoGL.UNSIGNED_SHORT, 3, triangles));

let projMatrix = mat4.create();
let viewMatrix = mat4.create();
let viewProjMatrix = mat4.create();
let modelMatrix = mat4.create();
let modelViewMatrix = mat4.create();
let modelViewProjectionMatrix = mat4.create();
let rotateXMatrix = mat4.create();
let rotateYMatrix = mat4.create();

let drawCall = app.createDrawCall(program, vertexArray, PicoGL.TRIANGLE)
    .uniform("bgColor", bgColor)
    .uniform("fgColor", fgColor);

let startTime = new Date().getTime() / 1000;



function draw() {
    let time = new Date().getTime() / 500 - startTime;

    mat4.perspective(projMatrix, Math.PI / 4, app.width / app.height, 0.1, 100.0);
    mat4.lookAt(viewMatrix, vec3.fromValues(3, 0, 2), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
    mat4.multiply(viewProjMatrix, projMatrix, viewMatrix);

    mat4.fromXRotation(rotateXMatrix, time * 0.1136);
    mat4.fromYRotation(rotateYMatrix, time * 0.2235);
    mat4.multiply(modelMatrix, rotateXMatrix, rotateYMatrix);

    mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);
    mat4.multiply(modelViewProjectionMatrix, viewProjMatrix, modelMatrix);

    drawCall.uniform("modelViewMatrix", modelViewMatrix);
    drawCall.uniform("modelViewProjectionMatrix", modelViewProjectionMatrix);

    app.clear();
    drawCall.draw();

    // mat4.fromTranslation(modelMatrix, vec3.fromValues(0, 0, 0));
    // mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);
    // mat4.multiply(modelViewProjectionMatrix, viewProjMatrix, modelMatrix);
    // drawCall.uniform("modelViewMatrix", modelViewMatrix);
    // drawCall.uniform("modelViewProjectionMatrix", modelViewProjectionMatrix);
    // drawCall.draw();

    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
