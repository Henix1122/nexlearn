# Fonts Directory

Place custom TTF font files here to embed them in generated certificate PDFs.

Example usage in code:

```ts
await downloadCertificate({
  recipient: user.name,
  title: course.title,
  type: 'course',
  issued: new Date(),
  id: course.id,
  fontUrl: '/assets/fonts/Inter-Regular.ttf',
  fontName: 'InterRegular',
  quality: 'high'
});
```

Notes:
- Ensure font is licensed for embedding.
- CORS: Serving from same origin avoids cross-origin issues.
- Fallback: If fetching or embedding fails, default jsPDF font is used.
- Performance: Large fonts add to PDF size; consider subsetting.
