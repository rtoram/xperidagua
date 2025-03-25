const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let img = new Image();
let mode = '';
let isDragging = false;
let startX, startY, endX, endY;
let history = [];

// Upload da imagem
document.getElementById('upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    img.src = URL.createObjectURL(file);
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        saveState();
    };
});

function saveState() {
    history.push(canvas.toDataURL());
}

function undo() {
    if (history.length > 1) {
        history.pop();
        const imgData = history[history.length - 1];
        const img = new Image();
        img.src = imgData;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }
}

// Ativar modo de corte
function cropMode() {
    mode = 'crop';
    alert('Clique e arraste para selecionar a área de corte.');
}

// Ativar modo de remoção de marca d'água
function inpaintMode() {
    mode = 'inpaint';
    alert('Clique e arraste para selecionar a área da marca d\'água.');
}

// Ativar modo de borracha
function eraseMode() {
    mode = 'erase';
    alert('Clique e arraste para apagar a marca d\'água.');
}

// Ativar modo de clonar
function cloneMode() {
    mode = 'clone';
    alert('Clique para selecionar a área a ser clonada e arraste para aplicar.');
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    isDragging = true;

    if (mode === 'erase') {
        erase(startX, startY);
    } else if (mode === 'clone') {
        cloneX = startX;
        cloneY = startY;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging && (mode === 'crop' || mode === 'inpaint')) {
        const rect = canvas.getBoundingClientRect();
        endX = e.clientX - rect.left;
        endY = e.clientY - rect.top;

        // Redesenha a imagem original
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        // Desenha o retângulo de seleção
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, endX - startX, endY - startY);
    } else if (isDragging && mode === 'erase') {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        erase(x, y);
    } else if (isDragging && mode === 'clone') {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        clone(cloneX, cloneY, x, y);
    }
});

canvas.addEventListener('mouseup', () => {
    if (isDragging && mode === 'crop') {
        isDragging = false;

        // Calcula a área de corte
        const cropX = Math.min(startX, endX);
        const cropY = Math.min(startY, endY);
        const cropWidth = Math.abs(endX - startX);
        const cropHeight = Math.abs(endY - startY);

        // Salva a área de corte
        const croppedImage = ctx.getImageData(cropX, cropY, cropWidth, cropHeight);
        
        // Redesenha a imagem original
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        // Aplica a área de corte na imagem original
        ctx.putImageData(croppedImage, cropX, cropY);

        // Atualiza a imagem original para o recorte
        img.src = canvas.toDataURL();
        saveState();
    } else if (isDragging && mode === 'inpaint') {
        isDragging = false;

        // Calcula a área da marca d'água
        const inpaintX = Math.min(startX, endX);
        const inpaintY = Math.min(startY, endY);
        const inpaintWidth = Math.abs(endX - startX);
        const inpaintHeight = Math.abs(endY - startY);

        // Aplica a técnica de inpainting na área selecionada
        inpaintArea(inpaintX, inpaintY, inpaintWidth, inpaintHeight);
        saveState();
    } else if (isDragging && mode === 'erase') {
        isDragging = false;
        saveState();
    } else if (isDragging && mode === 'clone') {
        isDragging = false;
        saveState();
    }
});

// Função de inpainting
function inpaintArea(x, y, width, height) {
    const imageData = ctx.getImageData(x, y, width, height);
    const data = imageData.data;

    // Algoritmo simples de inpainting
    for (let i = 0; i < data.length; i += 4) {
        const avg = (getPixel(data, i - 4) + getPixel(data, i + 4) + getPixel(data, i - width * 4) + getPixel(data, i + width * 4)) / 4;
        setPixel(data, i, avg);
    }

    ctx.putImageData(imageData, x, y);
}

function getPixel(data, index) {
    return (data[index] + data[index + 1] + data[index + 2]) / 3;
}

function setPixel(data, index, value) {
    data[index] = value;
    data[index + 1] = value;
    data[index + 2] = value;
}

function erase(x, y) {
    ctx.clearRect(x - 10, y - 10, 20, 20);
}

function clone(sourceX, sourceY, destX, destY) {
    const imageData = ctx.getImageData(sourceX, sourceY, 20, 20);
    ctx.putImageData(imageData, destX - 10, destY - 10);
}

// Função de download
function download() {
    const link = document.createElement('a');
    link.download = 'imagem_sem_marca.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}
