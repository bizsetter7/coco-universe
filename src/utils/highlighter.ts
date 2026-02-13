export const getHighlighterStyle = (id: number | string | undefined) => {
    const HIGHLIGHTERS = [
        { id: 1, color: '#ccff00' },
        { id: 2, color: '#00ff00' },
        { id: 3, color: '#00ffff' },
        { id: 4, color: '#cc99ff' },
        { id: 5, color: '#ffcc00' },
        { id: 6, color: '#99ccff' },
        { id: 7, color: '#ff99ff' },
        { id: 8, color: '#ff00ff' },
    ];
    const h = HIGHLIGHTERS.find(item => String(item.id) === String(id));
    return h ? { backgroundColor: h.color, color: '#000', padding: '0 4px', borderRadius: '2px' } : {};
};
