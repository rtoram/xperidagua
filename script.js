const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let img = new Image();
let mode = '';
let isDragging = false;
let startX, startY, endX, endY;

// Upload da imagem
document.getElementById('upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    img.src = URL.createObjectURL(file);
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
    };
});

// Ativar modo de corte
function cropMode() {
    mode = 'crop';
    alert('Clique e arraste para selecionar a área de corte.');
}

// Ativar modo de desfoque
function blurMode() {
    mode = 'blur';
    alert('Clique e arraste para selecionar a área a ser desfocada.');
}

// Manipulação do mouse no canvas
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    isDragging = true;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging && mode === 'crop') {
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
    } else if (isDragging && mode === 'blur') {
        isDragging = false;

        // Calcula a área de desfoque
        const blurX = Math.min(startX, endX);
        const blurY = Math.min(startY, endY);
        const blurWidth = Math.abs(endX - startX);
        const blurHeight = Math.abs(endY - startY);

        // Aplica o desfoque na área selecionada
        blurArea(blurX, blurY, blurWidth, blurHeight);
    }
    isDragging = false;
});

// Função de desfoque
function blurArea(x, y, width, height) {
    const imageData = ctx.getImageData(x, y, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;     // Red
        data[i + 1] = avg; // Green
        data[i + 2] = avg; // Blue
    }

    ctx.putImageData(imageData, x, y);
}

// Função de download
function download() {
    const link = document.createElement('a');
    link.download = 'imagem_sem_marca.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}
