const upload = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cloneStampBtn = document.getElementById('cloneStamp');
const healingBrushBtn = document.getElementById('healingBrush');

let isDrawing = false;
let startX, startY;
let cloneSourceX, cloneSourceY;

upload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

cloneStampBtn.addEventListener('click', () => {
    canvas.addEventListener('mousedown', startClone);
    canvas.addEventListener('mousemove', drawClone);
    canvas.addEventListener('mouseup', stopClone);
});

function startClone(e) {
    isDrawing = true;
    startX = e.offsetX;
    startY = e.offsetY;
}

function drawClone(e) {
    if (!isDrawing) return;
    cloneSourceX = startX;
    cloneSourceY = startY;
    ctx.drawImage(canvas, cloneSourceX, cloneSourceY, 10, 10, e.offsetX, e.offsetY, 10, 10);
}

function stopClone() {
    isDrawing = false;
}

healingBrushBtn.addEventListener('click', () => {
    alert('Healing Brush selected');
});
