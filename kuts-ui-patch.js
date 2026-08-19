// Inject custom responsive CSS rules dynamically into the document head
const customStyle = document.createElement('style');
customStyle.innerHTML = `
    @media (max-width: 768px) {
        /* Force tables to be horizontally scrollable without breaking layouts */
        table { display: block; overflow-x: auto; white-space: nowrap; }
        /* Improve touch targets for mobile users */
        button, a, input, select { min-height: 44px; min-width: 44px; }
    }
`;
document.head.appendChild(customStyle);