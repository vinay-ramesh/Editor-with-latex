import React, { useRef, useMemo } from 'react';
import JoditEditor from 'jodit-react';
import katex from 'katex';
import html2canvas from 'html2canvas';
import 'katex/dist/katex.min.css';
import 'jodit/es5/jodit.min.css';
import formulaIcon from "../../assets/fxx.webp"

const JoditEditorWithLatex = () => {
    const editor = useRef(null);

    // Function to show LaTeX input dialog
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const showLatexDialog = (editorInstance) => {
        const dialog = editorInstance.dlg({
            title: 'Insert LaTeX Formula',
            resizable: false,
            draggable: true,
            buttons: ['fullsize', 'dialog.close']
        });

        // Create dialog content
        const dialogContent = `
      <div style="padding: 20px; width: 500px;">
        <div style="margin-bottom: 15px;">
          <label for="latex-input" style="display: block; margin-bottom: 5px; font-weight: bold;">
            Enter LaTeX Formula:
          </label>
          <textarea 
            id="latex-input" 
            placeholder="e.g., x = \\\\frac{-b \\\\pm \\\\sqrt{b^2 - 4ac}}{2a}"
            style="width: 100%; height: 100px; font-family: monospace; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
          ></textarea>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Preview:</label>
          <div 
            id="latex-preview" 
            style="min-height: 60px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;"
          >
            Enter LaTeX above to see preview
          </div>
        </div>
        
        <div style="text-align: right;">
          <button 
            id="latex-cancel" 
            style="margin-right: 10px; padding: 8px 16px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;"
          >
            Cancel
          </button>
          <button 
            id="latex-insert" 
            style="padding: 8px 16px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            Insert Formula
          </button>
        </div>
      </div>
    `;

        dialog.setContent(dialogContent);
        dialog.open();

        // Get DOM elements
        const latexInput = dialog.container.querySelector('#latex-input');
        const latexPreview = dialog.container.querySelector('#latex-preview');
        const insertBtn = dialog.container.querySelector('#latex-insert');
        const cancelBtn = dialog.container.querySelector('#latex-cancel');

        // Preview function
        const updatePreview = () => {
            const latexCode = latexInput.value.trim();
            if (latexCode) {
                try {
                    const html = katex.renderToString(latexCode, {
                        throwOnError: false,
                        displayMode: true
                    });
                    latexPreview.innerHTML = html;
                } catch (error) {
                    latexPreview.innerHTML = '<span style="color: red;">Error: Invalid LaTeX syntax</span>';
                }
            } else {
                latexPreview.innerHTML = 'Enter LaTeX above to see preview';
            }
        };

        // Event listeners
        latexInput.addEventListener('input', updatePreview);

        cancelBtn.addEventListener('click', () => {
            dialog.close();
        });

        insertBtn.addEventListener('click', () => {
            const latexCode = latexInput.value.trim();
            if (latexCode) {
                insertLatexAsImage(editorInstance, latexCode);
                dialog.close();
            }
        });

        // Focus on input
        latexInput.focus();
    };

    // Function to convert LaTeX to image using html2canvas
    const insertLatexAsImage = (editorInstance, latexCode) => {
        try {
            // Render LaTeX to HTML
            const html = katex.renderToString(latexCode, {
                throwOnError: false,
                displayMode: true
            });

            // Create a temporary div to render the formula
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            tempDiv.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        background: white;
        padding: 20px;
        font-size: 14px;
        // border: 1px solid #e0e0e0;
        // border-radius: 4px;
        // box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      `;

            document.body.appendChild(tempDiv);

            // Wait for fonts to load, then convert to canvas
            setTimeout(() => {
                html2canvas(tempDiv, {
                    backgroundColor: 'white',
                    scale: 2, // Higher quality
                    useCORS: true,
                    allowTaint: true,
                    logging: false
                }).then(canvas => {
                    // Convert canvas to data URL
                    const imageDataUrl = canvas.toDataURL('image/png');

                    // Insert image into editor
                    editorInstance.s.insertImage(imageDataUrl, {
                        'data-latex': latexCode,
                        'alt': `LaTeX: ${latexCode}`,
                        'title': 'LaTeX Formula',
                        'style': 'display: inline-block; vertical-align: middle; max-width: 100%;'
                    });

                    // Clean up
                    document.body.removeChild(tempDiv);
                }).catch(error => {
                    console.error('Error converting LaTeX to image:', error);
                    document.body.removeChild(tempDiv);
                    alert('Error converting LaTeX to image. Please try again.');
                });
            }, 200); // Give more time for fonts to load

        } catch (error) {
            console.error('Error rendering LaTeX:', error);
            alert('Error rendering LaTeX formula. Please check your syntax.');
        }
    };

    // Jodit configuration with custom button
    const config = useMemo(() => ({
        readonly: false,
        height: 400,

        extraButtons: [
            {
                name: 'latex',
                iconURL: formulaIcon,
                tooltip: 'Insert LaTeX Formula',
                exec: function (editor) {
                    showLatexDialog(editor);
                }
            }
        ],
        uploader: {
            insertImageAsBase64URI: true
        },
    }), [showLatexDialog]);

    return (
        <div>
            <h2>Jodit Editor with LaTeX Support</h2>
            <JoditEditor
                ref={editor}
                config={config}
                tabIndex={1}
            />
        </div>
    );
};

export default JoditEditorWithLatex;