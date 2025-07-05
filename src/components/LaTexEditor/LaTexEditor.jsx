import React, { useRef, useMemo } from 'react';
import JoditEditor from 'jodit-react';
import katex from 'katex';
import html2canvas from 'html2canvas';
import 'katex/dist/katex.min.css';
import 'jodit/es5/jodit.min.css';

const JoditEditorWithLatex = () => {
    const editor = useRef(null);

    // Function to show LaTeX input dialog
    const showLatexDialog = (editorInstance) => {
        // Save cursor position immediately when dialog opens
        const savedSelection = editorInstance.s.save();

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
            style="min-height: 60px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9; font-size: 14px;"
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

        // Preview function with 14px font size
        const updatePreview = () => {
            const latexCode = latexInput.value.trim();
            if (latexCode) {
                try {
                    const html = katex.renderToString(latexCode, {
                        throwOnError: false,
                        displayMode: true
                    });
                    latexPreview.innerHTML = html;
                    // Ensure preview also shows 14px font size
                    latexPreview.style.fontSize = '14px';
                    const previewElements = latexPreview.querySelectorAll('*');
                    previewElements.forEach(element => {
                        element.style.fontSize = '14px';
                    });
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
                // Pass the saved selection to the insert function
                insertLatexAsImageAtPosition(editorInstance, latexCode, savedSelection);
                dialog.close();
            }
        });

        // Focus on input
        latexInput.focus();
    };

    // Function to convert LaTeX to image using html2canvas at specific position
    const insertLatexAsImageAtPosition = (editorInstance, latexCode, savedSelection) => {
        try {
            // Render LaTeX to HTML with 14px font size
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
        font-size: 14px !important;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      `;

            // Override any existing font-size styles in the LaTeX HTML
            const katexElements = tempDiv.querySelectorAll('*');
            katexElements.forEach(element => {
                element.style.fontSize = '14px';
            });

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

                    // Restore the saved cursor position BEFORE inserting
                    editorInstance.s.restore(savedSelection);

                    // Insert image at the exact cursor position
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

    // Function to convert LaTeX to image using html2canvas
    const insertLatexAsImage = (editorInstance, latexCode) => {
        try {
            // Save the current cursor position/selection BEFORE creating the dialog
            const selection = editorInstance.s.save();

            // Render LaTeX to HTML with 14px font size
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
        font-size: 14px !important;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      `;

            // Override any existing font-size styles in the LaTeX HTML
            const katexElements = tempDiv.querySelectorAll('*');
            katexElements.forEach(element => {
                element.style.fontSize = '14px';
            });

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

                    // Restore the saved cursor position BEFORE inserting
                    editorInstance.s.restore(selection);

                    // Insert image at the exact cursor position
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
        buttons: [
            'bold', 'italic', 'underline', '|',
            'ul', 'ol', '|',
            'link', 'image', '|',
            'latex', // Our custom button
            '|',
            'source'
        ],
        extraButtons: [
            {
                name: 'latex',
                iconURL: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgM0gyMVYyMUgzVjNaIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIi8+Cjx0ZXh0IHg9IjEyIiB5PSIxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNlcmlmIiBmb250LXNpemU9IjgiIGZpbGw9IiMzMzMiIGZvbnQtc3R5bGU9Iml0YWxpYyI+TGHiiJRlWDwvdGV4dD4KPC9zdmc+',
                tooltip: 'Insert LaTeX Formula',
                exec: function (editor) {
                    showLatexDialog(editor);
                }
            }
        ],
        uploader: {
            insertImageAsBase64URI: true
        }
    }), []);

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