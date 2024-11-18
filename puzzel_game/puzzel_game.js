let pieces = [];
let imageUrl = "";
let gridSize = 3; // 기본 크기 (3x3)
let imageWidth, imageHeight;

// 1. 이미지 업로드 후 퍼즐 설정 시작
document.getElementById("startButton").addEventListener("click", function() {
    const fileInput = document.getElementById("imageUpload");
    const selectedFile = fileInput.files[0];
    
    if (selectedFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imageUrl = e.target.result;
            const pieceSize = document.getElementById("pieceSize").value;
            gridSize = parseInt(pieceSize);
            loadImage(imageUrl);
        };
        reader.readAsDataURL(selectedFile);
    } else {
        alert("이미지를 업로드해주세요.");
    }
});

// 2. 이미지를 로드하고 크기를 계산하여 퍼즐 조각 생성
function loadImage(imageUrl) {
    const img = new Image();
    img.src = imageUrl;
    
    img.onload = function() {
        imageWidth = img.width;
        imageHeight = img.height;
        createPuzzle();
    };
}

// 3. 퍼즐 생성
function createPuzzle() {
    const container = document.getElementById("puzzle-container");
    container.innerHTML = ""; // 기존 퍼즐 초기화

    // 퍼즐을 위한 그리드 설정
    const pieceWidth = imageWidth / gridSize;
    const pieceHeight = imageHeight / gridSize;
    container.style.gridTemplateColumns = `repeat(${gridSize}, ${pieceWidth}px)`;
    container.style.gridTemplateRows = `repeat(${gridSize}, ${pieceHeight}px)`;

    pieces = [];
    
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const piece = document.createElement("div");
            piece.classList.add("puzzle-piece");
            piece.style.backgroundImage = `url(${imageUrl})`;
            piece.style.backgroundPosition = `-${col * pieceWidth}px -${row * pieceHeight}px`;

            // 각 퍼즐 조각에 id 설정
            piece.setAttribute("data-id", row * gridSize + col);

            // 드래그 이벤트 추가
            piece.draggable = true;
            piece.addEventListener("dragstart", onDragStart);
            piece.addEventListener("dragover", onDragOver);
            piece.addEventListener("drop", onDrop);

            // 퍼즐 조각을 컨테이너에 추가
            container.appendChild(piece);
            pieces.push(piece);
        }
    }
}

// 드래그 시작 시 발생하는 이벤트
function onDragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.dataset.id);
}

// 드래그 오버 시 발생하는 이벤트 (퍼즐 조각을 놓을 수 있도록 설정)
function onDragOver(event) {
    event.preventDefault();
}

// 드래그한 퍼즐 조각을 놓을 때 발생하는 이벤트
function onDrop(event) {
    event.preventDefault();
    const draggedId = event.dataTransfer.getData("text/plain");
    const draggedPiece = pieces[draggedId];
    const targetPiece = event.target;

    // 두 조각이 같은 자리에 있을 경우 교환
    if (draggedPiece !== targetPiece) {
        const draggedPos = draggedPiece.style.backgroundPosition;
        draggedPiece.style.backgroundPosition = targetPiece.style.backgroundPosition;
        targetPiece.style.backgroundPosition = draggedPos;

        // 각 퍼즐 조각의 id를 교환
        const tempId = draggedPiece.dataset.id;
        draggedPiece.dataset.id = targetPiece.dataset.id;
        targetPiece.dataset.id = tempId;
    }

    checkWinCondition();
}

// 퍼즐이 완성되었는지 확인하는 함수
function checkWinCondition() {
    for (let i = 0; i < pieces.length; i++) {
        const piece = pieces[i];
        const correctPosX = (i % gridSize) * (imageWidth / gridSize);
        const correctPosY = Math.floor(i / gridSize) * (imageHeight / gridSize);
        const currentPosX = parseInt(piece.style.backgroundPosition.split(' ')[0].slice(1));
        const currentPosY = parseInt(piece.style.backgroundPosition.split(' ')[1].slice(1));

        if (currentPosX !== correctPosX || currentPosY !== correctPosY) {
            return; // 퍼즐이 완성되지 않으면 함수 종료
        }
    }
    alert("퍼즐을 맞췄습니다! 축하합니다!");
}
