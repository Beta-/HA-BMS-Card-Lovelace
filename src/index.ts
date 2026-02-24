import { JkBmsReactorCard } from './card';
import { JkBmsReactorCardEditor } from './editor';

// Register the custom elements
customElements.define('jk-bms-reactor-card', JkBmsReactorCard);
customElements.define('jk-bms-reactor-card-editor', JkBmsReactorCardEditor);

// Expose version for debugging
console.info(
    '%c JK-BMS-REACTOR-CARD %c v1.0.0 ',
    'color: white; background: #03a9f4; font-weight: 700;',
    'color: #03a9f4; background: white; font-weight: 700;'
);

// Add to window for card picker
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
    type: 'jk-bms-reactor-card',
    name: 'JK BMS Reactor Card',
    description: 'A reactor-style visualization card for JK BMS battery packs',
    preview: false,
});
