import { Desktop } from './components/scene/Desktop';
import { HaloProvider } from './state/HaloContext';

export default function App() {
  return (
    <HaloProvider>
      <Desktop />
    </HaloProvider>
  );
}
