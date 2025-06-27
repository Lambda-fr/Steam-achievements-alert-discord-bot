//print on several lines
function printAtWordWrap(context, text, x, y, lineHeight, fitWidth) {
    fitWidth = fitWidth || 0;
    lineHeight = lineHeight || 20;

    var currentLine = 0;

    var lines = text.split(/\r\n|\r|\n/);
    for (var line = 0; line < lines.length; line++) {


        if (fitWidth <= 0) {
            context.fillText(lines[line], x, y + (lineHeight * currentLine));
        } else {
            var words = lines[line].split(' ');
            var idx = 1;
            while (words.length > 0 && idx <= words.length) {
                var str = words.slice(0, idx).join(' ');
                var w = context.measureText(str).width;
                if (w > fitWidth) {
                    if (idx == 1) {
                        idx = 2;
                    }
                    context.fillText(words.slice(0, idx - 1).join(' '), x, y + (lineHeight * currentLine));
                    currentLine++;
                    words = words.splice(idx - 1);
                    idx = 1;
                }
                else { idx++; }
            }
            if (idx > 0)
                context.fillText(words.join(' '), x, y + (lineHeight * currentLine));
        }
        currentLine++;
    }
    return currentLine;
}

export { printAtWordWrap }