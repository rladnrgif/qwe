const simulationCanvas = document.getElementById('simulationCanvas');
const simulationCtx = simulationCanvas.getContext('2d');
const graphCanvas = document.getElementById('graphCanvas');
const graphCtx = graphCanvas.getContext('2d');
const button = document.getElementById('startButton');

// 공의 초기 속도와 위치
let y = 0; // 공의 위치 (세로)
const radius = 20; // 공의 반지름
const gravity = 0.5; // 중력 가속도
let velocity = 0; // 공의 속도
const damping = 0.8; // 바닥에 튕길 때 감쇠 비율
let animationRunning = false; // 애니메이션 상태
let animationFrameId; // 애니메이션 프레임 ID

// 속도-시간 데이터 저장
const times = [];
const velocities = [];
const maxDataPoints = 100; // 그래프에 표시할 최대 데이터 포인트 수
let startTime = Date.now();

function drawBall() {
    simulationCtx.clearRect(0, 0, simulationCanvas.width, simulationCanvas.height); // 캔버스 초기화
    simulationCtx.beginPath();
    simulationCtx.arc(simulationCanvas.width / 2, y, radius, 0, Math.PI * 2);
    simulationCtx.fillStyle = 'blue';
    simulationCtx.fill();
    simulationCtx.closePath();
}

function drawGraph() {
    graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height); // 캔버스 초기화
    graphCtx.beginPath();
    graphCtx.moveTo(0, graphCanvas.height);
    
    const timeScale = graphCanvas.width / (times[times.length - 1] || 1); // X 축 스케일
    const velocityScale = graphCanvas.height / (Math.max(...velocities) || 1); // Y 축 스케일

    for (let i = 0; i < times.length; i++) {
        const x = times[i] * timeScale;
        const y = graphCanvas.height - (velocities[i] * velocityScale);
        graphCtx.lineTo(x, y);
    }

    graphCtx.strokeStyle = 'red';
    graphCtx.stroke();
    graphCtx.closePath();
}

function update() {
    if (animationRunning) {
        const currentTime = Date.now() - startTime; // 경과 시간
        velocity += gravity; // 중력에 의해 속도 증가
        y += velocity; // 속도에 따라 위치 변경

        // 바닥에 닿으면 반사
        if (y + radius > simulationCanvas.height) {
            y = simulationCanvas.height - radius; // 바닥에 맞춰서 위치 조정
            velocity *= -damping; // 반사 후 속도 감쇠

            // 반사 후 속도가 매우 작으면 애니메이션 멈춤
            if (Math.abs(velocity) < 0.1) {
                velocity = 0; // 속도를 0으로 설정하여 멈추게 함
                animationRunning = false; // 애니메이션 상태를 멈춤으로 변경
                cancelAnimationFrame(animationFrameId); // 애니메이션 프레임 취소
                return; // 업데이트 루프를 종료
            }
        }

        // 속도-시간 데이터 업데이트
        if (times.length >= maxDataPoints) {
            times.shift();
            velocities.shift();
        }
        times.push(currentTime / 1000); // 시간(초 단위)
        velocities.push(velocity);

        drawBall();
        drawGraph();
        animationFrameId = requestAnimationFrame(update); // 다음 프레임 요청
    }
}

button.addEventListener('click', () => {
    if (!animationRunning) {
        y = radius; // 공을 시작 위치로 설정
        velocity = 0; // 속도를 초기화
        times.length = 0; // 데이터 초기화
        velocities.length = 0; // 데이터 초기화
        startTime = Date.now(); // 시작 시간 초기화
        animationRunning = true;
        update(); // 애니메이션 시작
    }
});
