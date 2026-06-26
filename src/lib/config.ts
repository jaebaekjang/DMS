// mock mode 여부. NEXT_PUBLIC_USE_MOCK_DATA=false 일 때만 Google Sheets 연동.
export const USE_MOCK_DATA =
  process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";
