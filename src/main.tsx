import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PreviewRouter } from './preview/PreviewRouter';
import './preview/shell.css';

createRoot(document.getElementById('root')!).render(<StrictMode><PreviewRouter /></StrictMode>);
