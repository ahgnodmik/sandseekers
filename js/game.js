

// 게임 상태 관리
class GameState {
    constructor() {
        this.stones = 0;
        this.soil = 0;
        this.hasPlanet = false;
        this.claimedAreas = [];
        this.currentPath = [];
        this.isDrawing = false;
        this.startTime = Date.now();
        this.isGuestMode = false;
        this.userId = null;
    }

    setUserMode(user, isGuest = false) {
        this.isGuestMode = isGuest;
        this.userId = isGuest ? 'guest-' + Date.now() : user.uid;
        this.startTime = Date.now();
    }

    addResources(stoneAmount, soilAmount) {
        this.stones += stoneAmount;
        this.soil += soilAmount;
        this.updateUI();
        this.checkPlanetCreation();
    }

    updateUI() {
        const stoneCount = document.getElementById('stoneCount');
        const soilCount = document.getElementById('soilCount');
        const guestModeIndicator = document.getElementById('guestModeIndicator');
        
        if (stoneCount) stoneCount.textContent = this.stones;
        if (soilCount) soilCount.textContent = this.soil;
        
        // 게스트 모드 표시 업데이트
        if (guestModeIndicator) {
            if (this.isGuestMode) {
                guestModeIndicator.classList.remove('hidden');
            } else {
                guestModeIndicator.classList.add('hidden');
            }
        }
    }

    checkPlanetCreation() {
        const createPlanetBtn = document.getElementById('createPlanetBtn');
        if (createPlanetBtn) {
            if (this.stones >= 50 && this.soil >= 100 && !this.hasPlanet) {
                createPlanetBtn.disabled = false;
            } else {
                createPlanetBtn.disabled = true;
            }
        }
    }

    createPlanet() {
        if (this.stones >= 50 && this.soil >= 100 && !this.hasPlanet) {
            this.stones -= 50;
            this.soil -= 100;
            this.hasPlanet = true;
            this.updateUI();
            this.checkPlanetCreation();
            trackPlanetCreated();
            this.showPlanetModal();
            this.saveGameData();
        }
    }

    showPlanetModal() {
        const modal = document.getElementById('planetModal');
        const planetPreview = document.getElementById('planetPreview');
        
        if (modal && planetPreview) {
            // 행성 색상 랜덤 생성
            const colors = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            planetPreview.style.background = `radial-gradient(circle, ${randomColor}, ${randomColor}40)`;
            
            modal.classList.remove('hidden');
        }
    }

    calculateArea(points) {
        if (points.length < 3) return 0;
        
        let area = 0;
        for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;
            area += points[i].x * points[j].y;
            area -= points[j].x * points[i].y;
        }
        return Math.abs(area) / 2;
    }

    claimArea(points) {
        const area = this.calculateArea(points);
        if (area < 100) return; // 너무 작은 영역은 무시

        // 자원 계산 (면적에 비례)
        const stoneGained = Math.floor(area / 100);
        const soilGained = Math.floor(area / 50);

        this.addResources(stoneGained, soilGained);
        this.claimedAreas.push(points);
        
        trackAreaClaimed(area, stoneGained, soilGained);
        this.showResourceNotification(stoneGained, soilGained);
    }

    showResourceNotification(stoneGained, soilGained) {
        const notification = document.getElementById('resourceNotification');
        if (notification) {
            notification.textContent = `돌 +${stoneGained}, 흙 +${soilGained}`;
            notification.classList.remove('hidden');
            
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 2000);
        }
    }

    async saveGameData() {
        if (this.isGuestMode) {
            // 게스트 모드에서는 로컬 스토리지 사용
            try {
                localStorage.setItem('sandseekers-guest-data', JSON.stringify({
                    stones: this.stones,
                    soil: this.soil,
                    hasPlanet: this.hasPlanet,
                    userId: this.userId,
                    lastUpdated: new Date().toISOString()
                }));
            } catch (error) {
                console.error('로컬 저장 실패:', error);
            }
            return;
        }

        if (!auth.currentUser) return;
        
        try {
            await db.collection('users').doc(auth.currentUser.uid).set({
                stones: this.stones,
                soil: this.soil,
                hasPlanet: this.hasPlanet,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('게임 데이터 저장 실패:', error);
        }
    }

    async loadGameData() {
        if (this.isGuestMode) {
            // 게스트 모드에서는 로컬 스토리지에서 로드
            try {
                const savedData = localStorage.getItem('sandseekers-guest-data');
                if (savedData) {
                    const data = JSON.parse(savedData);
                    this.stones = data.stones || 0;
                    this.soil = data.soil || 0;
                    this.hasPlanet = data.hasPlanet || false;
                    this.userId = data.userId || this.userId;
                    this.updateUI();
                    this.checkPlanetCreation();
                }
            } catch (error) {
                console.error('로컬 데이터 로드 실패:', error);
            }
            return;
        }

        if (!auth.currentUser) return;
        
        try {
            const doc = await db.collection('users').doc(auth.currentUser.uid).get();
            if (doc.exists) {
                const data = doc.data();
                this.stones = data.stones || 0;
                this.soil = data.soil || 0;
                this.hasPlanet = data.hasPlanet || false;
                this.updateUI();
                this.checkPlanetCreation();
            }
        } catch (error) {
            console.error('게임 데이터 로드 실패:', error);
        }
    }
}

// Canvas 게임 엔진
class GameCanvas {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('게임 캔버스를 찾을 수 없습니다.');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        this.setupEventListeners();
        this.createStars();
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        if (!this.canvas) return;
        
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // 마우스 이벤트
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.endDrawing());
        
        // 터치 이벤트
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.endDrawing();
        });
    }

    createStars() {
        const starsContainer = document.getElementById('stars');
        if (!starsContainer) return;
        
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.width = Math.random() * 3 + 1 + 'px';
            star.style.height = star.style.width;
            star.style.animationDelay = Math.random() * 2 + 's';
            starsContainer.appendChild(star);
        }
    }

    startDrawing(e) {
        if (!this.canvas || !gameState) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        gameState.isDrawing = true;
        gameState.currentPath = [{x, y}];
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.strokeStyle = '#4F46E5';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
    }

    draw(e) {
        if (!this.canvas || !gameState || !gameState.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        gameState.currentPath.push({x, y});
        
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    endDrawing() {
        if (!gameState || !gameState.isDrawing) return;
        
        gameState.isDrawing = false;
        
        if (gameState.currentPath.length > 2) {
            // 시작점과 끝점을 연결
            const startPoint = gameState.currentPath[0];
            const endPoint = gameState.currentPath[gameState.currentPath.length - 1];
            const distance = Math.sqrt(
                Math.pow(endPoint.x - startPoint.x, 2) + 
                Math.pow(endPoint.y - startPoint.y, 2)
            );
            
            // 시작점과 끝점이 충분히 가까우면 영역을 닫음
            if (distance < 50) {
                gameState.currentPath.push(startPoint);
                this.fillArea(gameState.currentPath);
                gameState.claimArea(gameState.currentPath);
            }
        }
        
        gameState.currentPath = [];
    }

    fillArea(points) {
        if (!this.ctx) return;
        
        this.ctx.fillStyle = 'rgba(79, 70, 229, 0.3)';
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        
        this.ctx.closePath();
        this.ctx.fill();
        
        // 테두리 그리기
        this.ctx.strokeStyle = '#4F46E5';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    clear() {
        if (!this.ctx || !this.canvas) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    render() {
        if (!this.ctx || !gameState) return;
        
        this.clear();
        
        // 기존에 점유한 영역들 다시 그리기
        gameState.claimedAreas.forEach(area => {
            this.fillArea(area);
        });
    }
}

// 게임 인스턴스 생성
let gameState;
let gameCanvas;

// 게임 시작 함수
async function startGame(user = null, isGuestMode = false) {
    // 로그인 화면 숨기기
    const loginScreen = document.getElementById('loginScreen');
    const gameScreen = document.getElementById('gameScreen');
    
    if (loginScreen) loginScreen.classList.add('hidden');
    if (gameScreen) gameScreen.classList.remove('hidden');
    
    // 게임 초기화
    gameState = new GameState();
    gameCanvas = new GameCanvas();
    
    // 사용자 모드 설정
    if (isGuestMode) {
        gameState.setUserMode(null, true);
        trackGuestModeStart();
    } else if (user) {
        gameState.setUserMode(user, false);
    }
    
    // 게임 데이터 로드
    await gameState.loadGameData();
    
    // 게임 시작 이벤트 추적
    trackGameStart();
    
    // 주기적으로 자원 상태 추적
    setInterval(() => {
        if (gameState) {
            trackResourceCheck(gameState.stones, gameState.soil);
        }
    }, 60000); // 1분마다
}

// 인증 상태 변경 감지
if (auth && auth.onAuthStateChanged) {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Google 로그인 성공
            await startGame(user, false);
        } else {
            // 로그아웃
            const loginScreen = document.getElementById('loginScreen');
            const gameScreen = document.getElementById('gameScreen');
            
            if (loginScreen) loginScreen.classList.remove('hidden');
            if (gameScreen) gameScreen.classList.add('hidden');
            
            // 세션 종료 이벤트 추적
            if (gameState) {
                const playTime = Math.floor((Date.now() - gameState.startTime) / 1000);
                trackSessionEnd(playTime, gameState.stones, gameState.soil);
            }
        }
    });
}

// 이벤트 리스너들
document.addEventListener('DOMContentLoaded', () => {
    // Google 로그인 버튼
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            try {
                trackGoogleLoginAttempt();
                
                if (auth && auth.signInWithPopup && googleProvider) {
                    const result = await auth.signInWithPopup(googleProvider);
                    trackGoogleLoginSuccess();
                } else {
                    // Firebase가 없는 경우 데모 모드로 실행
                    await startGame(null, true);
                }
            } catch (error) {
                console.error('로그인 실패:', error);
                trackGoogleLoginFailure(error);
                
                // 오류 메시지 표시
                const errorMessage = document.getElementById('errorMessage');
                if (errorMessage) {
                    errorMessage.textContent = '로그인에 실패했습니다. 게스트 모드로 시도해보세요.';
                    errorMessage.classList.remove('hidden');
                    
                    setTimeout(() => {
                        errorMessage.classList.add('hidden');
                    }, 5000);
                }
            }
        });
    }

    // 게스트 로그인 버튼
    const guestLoginBtn = document.getElementById('guestLoginBtn');
    if (guestLoginBtn) {
        guestLoginBtn.addEventListener('click', async () => {
            await startGame(null, true);
        });
    }

    // 로그아웃 버튼
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                if (auth && auth.signOut) {
                    await auth.signOut();
                } else {
                    // 게스트 모드에서는 로그인 화면으로 돌아가기
                    const loginScreen = document.getElementById('loginScreen');
                    const gameScreen = document.getElementById('gameScreen');
                    
                    if (loginScreen) loginScreen.classList.remove('hidden');
                    if (gameScreen) gameScreen.classList.add('hidden');
                }
            } catch (error) {
                console.error('로그아웃 실패:', error);
            }
        });
    }

    // 행성 만들기 버튼
    document.addEventListener('click', (e) => {
        if (e.target.id === 'createPlanetBtn' && gameState) {
            gameState.createPlanet();
        }
    });

    // 행성 모달 닫기
    document.addEventListener('click', (e) => {
        if (e.target.id === 'closePlanetModal') {
            const modal = document.getElementById('planetModal');
            if (modal) modal.classList.add('hidden');
        }
    });

    // 페이지 언로드 시 데이터 저장
    window.addEventListener('beforeunload', () => {
        if (gameState) {
            gameState.saveGameData();
        }
    });
});

// 게임 루프
function gameLoop() {
    if (gameCanvas) {
        gameCanvas.render();
    }
    requestAnimationFrame(gameLoop);
}

// 게임 루프 시작
gameLoop();
