# 안전보건 서류 작성

브라우저 안에서 작업유형 분류와 안전보건 HWPX/PDF 파일 생성을 수행하는 정적 웹앱입니다.
입력정보를 받는 서버 API는 없습니다. 학교명과 학교 담당자만 브라우저 localStorage에 저장합니다.
다른 입력값은 페이지 메모리에만 유지되며, 사이트 접속·실행자료 요청은 정적 호스팅 서버에 전달됩니다.

## GitHub Pages

이 폴더의 **내용 전체**를 `safety-docs-web` 저장소 main 브랜치 루트에 올립니다.
Settings → Pages → Build and deployment → Source: Deploy from a branch.
Branch: main / Folder: / (root) → Save.
예상 주소: https://jtjdgml12-sudo.github.io/safety-docs-web/

프로젝트 Python 원본·학습자료·joblib/pkl 원본은 포함하지 않습니다.
assets의 ZIP/WHL은 브라우저 실행에 필요한 자료이며 전달용 압축파일이 아닙니다.
runtime.zip은 프로젝트 실행용 바이트코드·85유형 JSON·추론계수·템플릿·폰트를 포함합니다.
표준 라이브러리와 외부 패키지는 해당 공개 런타임 배포본을 사용합니다.
바이트코드는 소스 비밀성을 보장하지 않습니다.
PDF는 웹 미리보기 기준이며 한글 원본 서식은 HWPX를 권장합니다.
실제 작업 및 현장 여건에 맞게 확인·수정 후 사용하세요.
