function copyCodeToClipboard(button) {
    const codeText = button.nextElementSibling.textContent.trim();
    const originalText = button.textContent;

    navigator.clipboard.writeText(codeText).then(() => {
        button.textContent = '✓';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        button.textContent = 'Error';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('pre > button');
    buttons.forEach(button => {
        button.addEventListener('click', function () {
            copyCodeToClipboard(this);
        });
    });
});

