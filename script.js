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

// Ativar modo de preenchimento
function fillMode() {
    mode = 'fill';
    alert('Clique na marca d\'água para preencher com a cor escolhida.');
}

// Manipulação do mouse no canvas
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    isDragging = true;

    if (mode === 'fill') {
        const color = document.getElementById('fillColor').value;
        ctx.fillStyle = color;
        ctx.fillRect(startX - 15, startY - 15, 30, 30); // Preenche uma área pequena
    }
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

        // Corta a imagem
        const croppedImage = ctx.getImageData(cropX, cropY, cropWidth, cropHeight);
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        ctx.putImageData(croppedImage, 0, 0);

        // Atualiza a imagem original para o recorte
        img.src = canvas.toDataURL();
    }
    isDragging = false;
});

// Função de download
function download() {
    const link = document.createElement('a');
    link.download = 'imagem_sem_marca.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}
