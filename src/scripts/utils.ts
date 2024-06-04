export function normalizeCoords(x:number, y:number) {
    let p = document.getElementById("game") as HTMLElement

    do {
        x -= p.offsetLeft;
        y -= p.offsetTop;

        p = p.offsetParent as HTMLElement;
    } while (p != null)

    return [x, y]
}