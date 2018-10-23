// Home task: combine lighting reflection with texturing
// And, as always, be creative: add/remove light sources, add more objects, change rotations/movements.
// Make it look cool ;)


// Monkey
let positions = new Float32Array([
    // front
    -0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, -0.5, 0.5,
    -0.5, -0.5, 0.5,

    // back
    -0.5, 0.5, -0.5,
    0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,
    -0.5, -0.5, -0.5,

    //top
    -0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
    -0.5, 0.5, -0.5,

    //bottom
    -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,
    -0.5, -0.5, -0.5,

    //left
    -0.5, -0.5, 0.5,
    -0.5, 0.5, 0.5,
    -0.5, 0.5, -0.5,
    -0.5, -0.5, -0.5,

    //right
    0.5, -0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,
]);

let normals = new Float32Array([
    // front
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,

    // back
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,

    //top
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,

    //bottom
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,

    //left
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,

    //right
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
]);

let uvs = new Float32Array([
    // front
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    0.0, 0.0,

    // back
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    0.0, 0.0,

    //top
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    0.0, 0.0,

    //bottom
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    0.0, 0.0,

    //left
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    0.0, 0.0,

    //right
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    0.0, 0.0,
]);

let triangles = new Uint16Array([
    // front
    2, 1, 0,
    0, 3, 2,

    // back
    4, 5, 6,
    6, 7, 4,

    // top
    8, 9, 10,
    10, 11, 8,

    // bottom
    14, 13, 12,
    12, 15, 14,

    // left
    16, 17, 18,
    18, 19, 16,

    // right
    22, 21, 20,
    20, 23, 22,
]);

// ******************************************************
// **               Light configuration                **
// ******************************************************

let ambientLightColor = vec3.fromValues(1.0, 0.6, 0.7);
let numberOfLights = 2;
let lightColors = [vec3.fromValues(0.0, 0.2, 0.2), vec3.fromValues(0.0, 0.0, 0.2)];
let lightInitialPositions = [vec3.fromValues(5, 0, 2), vec3.fromValues(-5, 0, 2)];
let lightPositions = [vec3.create(), vec3.create()];


// language=GLSL
let lightCalculationShader = `
    uniform vec3 cameraPosition;
    uniform vec3 ambientLightColor;
    uniform vec3 lightColors[${numberOfLights}];
    uniform vec3 lightPositions[${numberOfLights}];

    // This function calculates light reflection using Phong reflection model (ambient + diffuse + specular)
    vec4 calculateLights(vec3 normal, vec3 position) {
        vec3 viewDirection = normalize(cameraPosition.xyz - position);
        vec4 color = vec4(ambientLightColor, 1.0);

        for (int i = 0; i < lightPositions.length(); i++) {
            vec3 lightDirection = normalize(lightPositions[i] - position);

            // Lambertian reflection (ideal diffuse of matte surfaces) is also a part of Phong model
            float diffuse = max(dot(lightDirection, normal), 0.0);

            // Phong specular highlight
            float specular = pow(max(dot(viewDirection, reflect(-lightDirection, normal)), 0.0), 50.0);

            // Blinn-Phong improved specular highlight
            //float specular = pow(max(dot(normalize(lightDirection + viewDirection), normal), 0.0), 200.0);

            color.rgb += lightColors[i] * diffuse + specular;
        }
        return color;
    }
`;

// language=GLSL
let fragmentShader = `
    #version 300 es
    precision highp float;
    ${lightCalculationShader}

    in vec3 vPosition;
    in vec3 vNormal;
    in vec4 vColor;

    out vec4 outColor;

    void main() {
        // For Phong shading (per-fragment) move color calculation from vertex to fragment shader
        outColor = calculateLights(normalize(vNormal), vPosition);
        //outColor = vColor;
    }
`;

// language=GLSL
let vertexShader = `
    #version 300 es
    ${lightCalculationShader}

    layout(location=0) in vec4 position;
    layout(location=1) in vec4 normal;

    uniform mat4 viewProjectionMatrix;
    uniform mat4 modelMatrix;

    out vec3 vPosition;
    out vec3 vNormal;
    out vec4 vColor;

    void main() {
        vec4 worldPosition = modelMatrix * position;

        vPosition = worldPosition.xyz;
        vNormal = (modelMatrix * normal).xyz;

        // For Gouraud shading (per-vertex) move color calculation from fragment to vertex shader
        //vColor = calculateLights(normalize(vNormal), vPosition);

        gl_Position = viewProjectionMatrix * worldPosition;
    }
`;


app.depthTest().cullBackfaces();

let program = app.createProgram(vertexShader.trim(), fragmentShader.trim());

let vertexArray = app.createVertexArray()
    .vertexAttributeBuffer(0, app.createVertexBuffer(PicoGL.FLOAT, 3, positions))
    .vertexAttributeBuffer(1, app.createVertexBuffer(PicoGL.FLOAT, 3, normals))
    .indexBuffer(app.createIndexBuffer(PicoGL.UNSIGNED_SHORT, 3, triangles));

let projectionMatrix = mat4.create();
let viewMatrix = mat4.create();
let viewProjectionMatrix = mat4.create();
let modelMatrix = mat4.create();




let drawCall = app.createDrawCall(program, vertexArray)
    .uniform("ambientLightColor", ambientLightColor);

let startTime = new Date().getTime() / 1000;

let cameraPosition = vec3.fromValues(0, 0, 5);
mat4.fromXRotation(modelMatrix, -Math.PI / 2);


function draw() {
    let time = new Date().getTime() / 3000 - startTime;

    mat4.perspective(projectionMatrix, Math.PI / 4, app.width / app.height, 0.1, 100.0);
    mat4.lookAt(viewMatrix, cameraPosition, vec3.zero, vec3.up);
    mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);
    let rotateXMatrix = mat4.create();
    let rotateYMatrix = mat4.create();
    mat4.fromXRotation(rotateXMatrix, time * 0.7000);
    mat4.fromYRotation(rotateYMatrix, time * 1.1000);
    mat4.multiply(modelMatrix, rotateXMatrix, rotateYMatrix);



  for (let i = 0; i < lightInitialPositions.length; i++)
        vec3.rotateZ(lightPositions[i], lightInitialPositions[i], vec3.zero, time);

    drawCall.uniform("viewProjectionMatrix", viewProjectionMatrix);
    drawCall.uniform("modelMatrix", modelMatrix);
    drawCall.uniform("cameraPosition", cameraPosition);
    drawCall.uniform("lightPositions", toUniformArray(lightPositions));
    drawCall.uniform("lightColors", toUniformArray(lightColors));

    app.clear();
    drawCall.draw();

    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
