import { createBrowserRouter } from 'react-router';
import { DesignerPage } from './pages/DesignerPage';
import { DocsPage } from './pages/DocsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: DesignerPage,
  },
  {
    path: '/docs',
    Component: DocsPage,
  },
]);
