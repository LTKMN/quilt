let scene, camera, renderer;
let triangles = [];
let triangleVertexes = [];
let previewDots = [];
let mouse = new THREE.Vector2();

init();
animate();

function init() {
    console.log("Initializing scene");

    // Create the scene
    scene = new THREE.Scene();
    
    // Set up the orthographic camera
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 10;
    camera = new THREE.OrthographicCamera(
        frustumSize * aspect / -2, 
        frustumSize * aspect / 2, 
        frustumSize / 2, 
        frustumSize / -2, 
        1, 
        1000 
    );
    camera.position.z = 10;

    // Set up the renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    // Event listeners
    window.addEventListener('mousedown', onMouseDown, false);
    window.addEventListener('resize', onWindowResize, false);

    // Export button
    document.getElementById('exportBtn').addEventListener('click', exportAsSVG);

    // Add guidelines
    addGuidelines();
}

function addGuidelines() {
    let material = new THREE.LineBasicMaterial({ color: 0x202020 });

    console.log("Adding guidelines");

    const size = 20; // Extend the guidelines to fill the screen entirely
    for (let i = 0; i < 12; i++) {
        let angle = i * Math.PI / 6;
        let x1 = Math.cos(angle) * size;
        let y1 = Math.sin(angle) * size;
        let geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(x1, y1, 0)]);
        let line = new THREE.Line(geometry, material);
        scene.add(line);
        console.log(`Added line from (0, 0, 0) to (${x1}, ${y1}, 0)`);
    }
    
    let horizontalLineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-size, 0, 0), new THREE.Vector3(size, 0, 0)]);
    let horizontalLine = new THREE.Line(horizontalLineGeometry, material);
    scene.add(horizontalLine);
    console.log("Added horizontal line");

    let verticalLineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -size, 0), new THREE.Vector3(0, size, 0)]);
    let verticalLine = new THREE.Line(verticalLineGeometry, material);
    scene.add(verticalLine);
    console.log("Added vertical line");
}

function onMouseDown(event) {
    event.preventDefault();
    
    console.log("Mouse down event");

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    let vector = new THREE.Vector3(mouse.x, mouse.y, 0);
    vector.unproject(camera);

    let x = vector.x;
    let y = vector.y;

    console.log(`Mouse click at (${x}, ${y})`);
    
    let dotGeometry = new THREE.CircleGeometry(0.05, 32);
    let dotMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    let dot = new THREE.Mesh(dotGeometry, dotMaterial);
    dot.position.set(x, y, 0);
    scene.add(dot);
    previewDots.push(dot);
    console.log("Added dot");

    triangleVertexes.push(new THREE.Vector3(x, y, 0));
    if (triangleVertexes.length === 3) {
        createTriangle(triangleVertexes);
        triangleVertexes = [];
        clearPreviewDots();
    }
}

function createTriangle(vertices) {
    let geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    geometry.setIndex([0, 1, 2]);
    geometry.computeVertexNormals();
    
    let material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    let mesh = new THREE.Mesh(geometry, material);
    
    scene.add(mesh);
    triangles.push(mesh);
    
    createSnowflake();
}

function createSnowflake() {
    clearSnowflake();

    triangles.forEach(triangle => {
        for (let i = 0; i < 6; i++) {
            let angle = i * Math.PI / 3;
            let cloned = triangle.clone();
            cloned.rotation.z = angle;
            scene.add(cloned);
            
            let mirror = cloned.clone();
            mirror.scale.y = -1;
            scene.add(mirror);
        }
    });
}

function clearSnowflake() {
    let children = scene.children.slice();
    children.forEach(child => {
        if (child instanceof THREE.Mesh && triangles.indexOf(child) === -1) {
            scene.remove(child);
        }
    });
}

function clearPreviewDots() {
    previewDots.forEach(dot => scene.remove(dot));
    previewDots = [];
}

function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 10;

    camera.left = frustumSize * aspect / -2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;

    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function exportAsSVG() {
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 8 8">`;
    
    triangles.forEach(triangle => {
        let vertices = triangle.geometry.attributes.position.array;
        for (let i = 0; i < 6; i++) {
            let angle = i * Math.PI / 3;
            let rotatedVertices = rotateVertices(vertices, angle);
            svgContent += generateSVGPath(rotatedVertices);
            
            let mirroredVertices = mirrorVertices(rotatedVertices);
            svgContent += generateSVGPath(mirroredVertices);
        }
    });

    svgContent += `</svg>`;
    
    downloadSVG(svgContent, 'snowflake.svg');
}

function rotateVertices(vertices, angle) {
    let rotated = [];
    for (let i = 0; i < vertices.length; i += 3) {
        let x = vertices[i];
        let y = vertices[i + 1];
        let rotatedX = x * Math.cos(angle) - y * Math.sin(angle);
        let rotatedY = x * Math.sin(angle) + y * Math.cos(angle);
        rotated.push(rotatedX, rotatedY, 0);
    }
    return rotated;
}

function mirrorVertices(vertices) {
    let mirrored = [];
    for (let i = 0; i < vertices.length; i += 3) {
        let x = vertices[i];
        let y = vertices[i + 1];
        mirrored.push(x, -y, 0);
    }
    return mirrored;
}

function generateSVGPath(vertices) {
    return `<path d="M ${vertices[0]} ${vertices[1]} L ${vertices[3]} ${vertices[4]} L ${vertices[6]} ${vertices[7]} Z" fill="white" stroke="black" />`;
}

function downloadSVG(svgContent, filename) {
    let blob = new Blob([svgContent], { type: 'image/svg+xml' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
