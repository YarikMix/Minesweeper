
export function normalizeCoords(x:number, y:number, canvas:HTMLCanvasElement) {
    let p = document.getElementById(canvas.id) as HTMLElement

    do {
        x -= p.offsetLeft;
        y -= p.offsetTop;

        p = p.offsetParent as HTMLElement;
    } while (p != null)

    const parent = canvas.parentElement as HTMLElement
    return [x + parent.scrollLeft, y + parent.scrollTop]
}