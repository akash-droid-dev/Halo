import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import './styles/global.css';
import './components/primitives/primitives.css';
import './components/island/island.css';
import './components/scene/scene.css';
import './components/settings/settings.css';
import './components/onboarding/onboarding.css';
import './modules/modules.css';

const container = document.getElementById('root');
if (!container) throw new Error('Missing #root element');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
