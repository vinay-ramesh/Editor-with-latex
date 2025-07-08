import React, { useRef, useMemo, useState } from 'react';
import JoditEditor from 'jodit-react';
import katex from 'katex';
import html2canvas from 'html2canvas';
import 'katex/dist/katex.min.css';
import 'jodit/es5/jodit.min.css';
import formulaIcon from "../../assets/fxx.webp";
import "./JoditEditorWithLatex.css";
import { dialogContent } from "./helperVariables";

const JoditEditorWithLatex = () => {
    const editor = useRef(null);
    const [questionContent, setQuestionContent] = useState("");

    const insertLatexAsImage = (editorInstance, latexCode) => {
        try {
            const html = katex.renderToString(latexCode, {
                throwOnError: false,
                displayMode: true, // Renders the formula as a block element
            });

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            // 1. Set padding to 0 on the container div
            tempDiv.style.cssText = `
                position: absolute;
                left: -9999px;
                top: -9999px;
                background: white;
                padding: 4px; /* IMPORTANT: Removed padding */
                font-size: 24px;
            `;

            // 2. Find the KaTeX element and remove its margin
            const katexElement = tempDiv.querySelector('.katex-display');
            if (katexElement) {
                katexElement.style.margin = '4'; // IMPORTANT: Override KaTeX default margin
            }

            document.body.appendChild(tempDiv);
    
            // Use a short timeout to ensure fonts are rendered
            setTimeout(() => {
                html2canvas(tempDiv, {
                    backgroundColor: null, // Transparent background
                    scale: 3,              // Higher scale for better resolution
                    useCORS: true,
                }).then(canvas => {
                    const imageDataUrl = canvas.toDataURL('image/png');

                    // Restore focus to the editor before inserting
                    editorInstance.s.focus();

                    const img = editorInstance.createInside.element('img');
                    img.src = imageDataUrl;
                    img.setAttribute('data-latex', latexCode);
                    img.setAttribute('alt', `LaTeX: ${latexCode}`);
                    img.style.verticalAlign = 'middle';
                    img.style.maxWidth = '100%';
                    // img.style.height = `${canvas.height / 3}px`; // Scale down the image in the editor == original
                    /* Decided to scale down the heiht some more by 3*2 = 6 times */
                    img.style.height = `${canvas.height / 6}px`; // Scale down the image in the editor

                    // Use Jodit's reliable API to insert the image
                    editorInstance.s.insertImage(img, false, null);

                    document.body.removeChild(tempDiv);
                }).catch(error => {
                    console.error('Error converting LaTeX to image:', error);
                    document.body.removeChild(tempDiv);
                    editorInstance.events.fire('errorMessage', 'Error creating formula image.');
                });
            }, 300);

        } catch (error) {
            console.error('Error rendering LaTeX:', error);
            editor.current.events.fire('errorMessage', 'Invalid LaTeX syntax.');
        }
    };

    const showLatexDialog = (editorInstance) => {
        // 1. Save cursor position using Jodit's API *before* opening the dialog
        editorInstance.s.save();

        const dialog = editorInstance.dlg({
            title: 'Insert LaTeX Formula',
            resizable: false,
            draggable: true,
            buttons: ['fullsize', 'dialog.close']
        });

        dialog.setContent(dialogContent);
        dialog.open();

        const latexInput = dialog.container.querySelector('#latex-input');
        const latexPreview = dialog.container.querySelector('#latex-preview');
        const insertBtn = dialog.container.querySelector('#latex-insert');
        const cancelBtn = dialog.container.querySelector('#latex-cancel');

        const updatePreview = () => {
            const latexCode = latexInput.value.trim();
            if (latexCode) {
                try {
                    latexPreview.innerHTML = katex.renderToString(latexCode, {
                        throwOnError: false,
                        displayMode: true
                    });
                } catch (error) {
                    latexPreview.innerHTML = '<span style="color: red;">Error: Invalid LaTeX syntax</span>';
                }
            } else {
                latexPreview.innerHTML = 'Enter LaTeX above to see preview';
            }
        };

        latexInput.addEventListener('input', updatePreview);
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            dialog.close();
        });

        insertBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const latexCode = latexInput.value.trim();
            if (latexCode) {
                // 2. Restore cursor position just before inserting
                editorInstance.s.restore();
                insertLatexAsImage(editorInstance, latexCode);
                dialog.close();
            }
        });

        latexInput.focus();
    };

    const config = useMemo(() => ({
        readonly: false,
        height: "80vh",
        // The default image button should now work correctly without event conflicts.
        uploader: {
            insertImageAsBase64URI: true
        },
        buttons: [
            'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript',
            '|', 'ul', 'ol', 'indent', 'outdent', 'lineHeight', '|',
            'brush', 'paragraph', '|', 'image', '|', 'table', '|', 'align',
            'undo', 'redo', '|', 'hr', 'eraser'
        ],
        extraButtons: [{
            name: 'latex',
            iconURL: formulaIcon,
            tooltip: 'Insert LaTeX Formula',
            exec: (editor) => showLatexDialog(editor)
        }],
        statusbar:false
        // 3. REMOVED custom event handlers that were causing conflicts.
        // events: {
        //     click: saveCursorPosition,
        //     keyup: saveCursorPosition,
        //     focus: restoreCursorPosition,
        // },
    }), []);

    const handleDownload = () => {
        if (questionContent) {
            const wrappedContent = `<div class="question_printable_text">${questionContent}</div>`;
            const blob = new Blob([wrappedContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${new Date().toISOString()}-question-content.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else {
            alert("Nothing to download.");
        }
    };

    return (
        <div className='editor'>
            <h2>Custom Editor with LaTeX/MathJax Support</h2>
            <JoditEditor
                ref={editor}
                value={questionContent}
                config={config}
                tabIndex={1}
                onBlur={newContent => setQuestionContent(newContent)}
            />
            <button style={{ padding: "10px", alignSelf: "flex-start", cursor: "pointer" }}
                onClick={handleDownload}
            >Download file
            </button>
        </div>
    );
};

export default JoditEditorWithLatex;