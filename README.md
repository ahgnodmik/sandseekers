# Sandseekers - 나만의 행성 만들기 🌍

우주를 탐험하며 나만의 행성을 만들어보는 웹 기반 캐주얼 게임입니다.

## 🎮 게임 특징

- **직관적인 조작**: 마우스나 터치로 자유롭게 영역을 그려 땅을 점유
- **자원 시스템**: 획득한 자원(돌, 흙)으로 행성 생성
- **5원소 테마**: 불, 물, 흙, 쇠, 나무의 원소 시스템 (향후 확장 예정)
- **데이터 저장**: Google 로그인으로 게임 진행상황 안전 보관
- **게스트 모드**: 로그인 없이도 즉시 플레이 가능
- **반응형 디자인**: 모든 기기에서 최적의 게임 경험

## 🌐 라이브 데모

**Sandseekers**는 Netlify에서 호스팅됩니다:
👉 [https://sandseekers.netlify.app](https://sandseekers.netlify.app)

## 🚀 시작하기

### 옵션 1: 즉시 플레이 (게스트 모드)
1. [라이브 데모](https://sandseekers.netlify.app)에 접속
2. "게스트 모드로 시작" 버튼 클릭
3. 로그인 없이 즉시 게임 플레이
4. 로컬 스토리지에 게임 데이터 저장

### 옵션 2: Google 로그인 (완전한 기능)

#### 1. Firebase 프로젝트 설정
1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Authentication에서 Google 로그인 활성화
3. Firestore Database 생성
4. 웹 앱 추가 후 설정 정보 복사

#### 2. Firebase 설정 적용
`js/firebase-config.js` 파일에서 Firebase 설정 정보를 업데이트하세요:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "G-PF8CX0WT7C"  // Google Analytics ID
};
```

#### 3. 로컬 개발 서버 실행
```bash
# Python 3
python -m http.server 8000

# 또는 Node.js
npx http-server

# 또는 PHP
php -S localhost:8000
```

#### 4. 게임 실행
브라우저에서 `http://localhost:8000`으로 접속하여 게임을 즐기세요!

## 🎯 게임 방법

1. **로그인 선택**: Google 로그인 또는 게스트 모드 선택
2. **영역 점유**: 마우스나 터치로 캔버스에 선을 그려 영역을 닫기
3. **자원 획득**: 점유한 영역의 크기에 비례하여 돌과 흙 획득
4. **행성 생성**: 돌 50개, 흙 100개를 모으면 행성 생성 가능
5. **데이터 저장**: 게임 진행상황이 자동으로 저장됨

## 🛠 기술 스택

- **프론트엔드**: HTML5, CSS3, JavaScript (ES6+)
- **게임 엔진**: Canvas API
- **백엔드**: Firebase (Auth, Firestore, Analytics)
- **스타일링**: Tailwind CSS
- **애널리틱스**: Google Analytics 4
- **호스팅**: Netlify

## 📊 데이터 분석

게임에서는 다음과 같은 이벤트를 추적합니다:

### 게임플레이 이벤트
- `game_start`: 게임 시작
- `area_claimed`: 영역 점유 (면적, 획득 자원량)
- `planet_created`: 행성 생성
- `resource_check`: 자원 상태 체크
- `session_end`: 세션 종료 (플레이 시간, 최종 자원량)

### 사용자 행동 이벤트
- `guest_mode_start`: 게스트 모드 시작
- `google_login_attempt`: Google 로그인 시도
- `google_login_success`: Google 로그인 성공
- `google_login_failure`: Google 로그인 실패

## 🔧 개발 및 배포

### 로컬 개발
```bash
git clone <repository-url>
cd sandseekers
python -m http.server 8000
```

### Netlify 배포
1. GitHub/GitLab에 코드 푸시
2. Netlify에서 새 사이트 생성
3. 저장소 연결
4. 자동 배포 완료!

### 환경 변수 (선택사항)
Netlify에서 다음 환경 변수를 설정할 수 있습니다:
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- 기타 Firebase 설정값들

## 🔮 향후 계획

### 2단계 확장 기능
- **다양한 자원**: 5원소(불, 물, 나무, 쇠) 추가
- **행성 꾸미기**: 원소별 행성 표면 장식
- **경쟁 요소**: 다른 사용자와의 상호작용
- **리더보드**: 자원 획득량 기반 순위 시스템

## 🐛 문제 해결

### 일반적인 문제들

**Q: 게임이 로딩되지 않습니다**
A: 브라우저 콘솔을 확인하고, Firebase 설정이 올바른지 확인하세요. 게스트 모드로도 플레이 가능합니다.

**Q: Google 로그인이 작동하지 않습니다**
A: Firebase Authentication에서 Google 로그인이 활성화되어 있는지 확인하세요.

**Q: 데이터가 저장되지 않습니다**
A: Firestore Database가 생성되어 있고, 보안 규칙이 올바르게 설정되어 있는지 확인하세요.

**Q: 게스트 모드에서 데이터가 사라집니다**
A: 게스트 모드는 로컬 스토리지를 사용합니다. 브라우저 데이터를 삭제하면 저장된 데이터가 사라집니다.

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

버그 리포트나 기능 제안은 이슈를 통해 해주세요!

---

**즐거운 우주 탐험 되세요! 🚀**
