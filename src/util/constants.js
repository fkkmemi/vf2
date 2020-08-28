export default {
  levels: [
    { text: '개발자', value: 0 },
    { text: '관리자', value: 1 },
    { text: '게시판관리자', value: 2 },
    { text: '게시판운영자', value: 3 },
    { text: '사용자', value: 4 },
    { text: '손님', value: 5 }
  ],
  themes: {
    light: {
      primary: '#0277BD',
      secondary: '#BDBDBD',
      accent: '#2C4027',
      info: '#4E7DA6',
      success: '#26A699',
      warning: '#F29727',
      error: '#BF0426'
    },
    dark: {
      primary: '#0277BD',
      secondary: '#424242',
      accent: '#2C4027',
      info: '#4E7DA6',
      success: '#26A699',
      warning: '#F29727',
      error: '#BF0426'
    }
  },
  themeDescription: {
    primary: '주요 버튼, 카테고리등',
    secondary: '비활성 상태, 읽은 메시지등',
    accent: '사용자 상태등',
    info: '설명, 태그등',
    success: '좋아요, 성공등',
    warning: '주의사항 경고창등',
    error: '새로운 글, 에러창등'
  }
}
