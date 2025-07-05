import React, { useRef, useMemo, useState, useCallback } from 'react';
import JoditEditor from 'jodit-react';
import katex from 'katex';
import html2canvas from 'html2canvas';
import 'katex/dist/katex.min.css';
import 'jodit/es5/jodit.min.css';
import formulaIcon from "../../assets/fxx.webp"
import "./JoditEditorWithLatex.css"

const JoditEditorWithLatex = () => {
    const editor = useRef(null);
    const [questionContent, setQuestionContent] = useState("")

    const contentChange = useCallback((newContent) => {
        setQuestionContent(newContent)
    }, [])

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

    // Jodit configuration with custom button --
    // const config = useMemo(() => ({
    //     readonly: false,
    //     height: "80vh",
    //     width:"100%",
    //     extraButtons: [
    //         {
    //             name: 'latex',
    //             iconURL: formulaIcon,
    //             tooltip: 'Insert LaTeX Formula',
    //             exec: function (editor) {
    //                 showLatexDialog(editor);
    //             }
    //         }
    //     ],
    //     uploader: {
    //         insertImageAsBase64URI: true
    //     },
    // }), [showLatexDialog]);

    const config = useMemo(() => ({
        readonly: false,
        height: "80vh",
        width: "100%",
        direction: 'ltr',
        defaultFontSize: '14px',
        defaultFontFamily: 'Calibre Body, sans-serif',
        controls: {
            latex: {
                name: 'latex',
                iconURL: formulaIcon, // Make sure 'formulaIcon' is imported or defined.
                tooltip: 'Insert LaTeX Formula',
                exec: function (editor) {
                    showLatexDialog(editor); // Make sure 'showLatexDialog' is accessible.
                }
            },
            subscript: {
                command: 'subscript',
                tooltip: 'Subscript',
                icon: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="2" fill="white"/>
                <path d="M7.61364 8.45455L11.3636 14.5057H11.4773L15.2273 8.45455H17.3011L12.7273 15.7273L17.3011 23H15.2273L11.4773 17.0625H11.3636L7.61364 23H5.53977L10.2273 15.7273L5.53977 8.45455H7.61364ZM18.8263 25.5V24.392L22.1502 21.4375C22.4817 21.1439 22.7586 20.8812 22.9812 20.6491C23.2037 20.4171 23.3718 20.1922 23.4854 19.9744C23.5991 19.7566 23.6559 19.5246 23.6559 19.2784C23.6559 18.8523 23.4925 18.5137 23.1658 18.2628C22.8391 18.0118 22.4343 17.8864 21.9513 17.8864C21.44 17.8864 21.0281 18.0237 20.7156 18.2983C20.4031 18.5682 20.2468 18.9233 20.2468 19.3636H18.7695C18.7695 18.554 19.0702 17.9029 19.6715 17.4105C20.2728 16.9134 21.0423 16.6648 21.9798 16.6648C22.6048 16.6648 23.154 16.7784 23.6275 17.0057C24.101 17.2282 24.4703 17.536 24.7354 17.929C25.0006 18.3172 25.1332 18.7576 25.1332 19.25C25.1332 19.6383 25.055 19.9981 24.8988 20.3295C24.7425 20.661 24.4987 21.0043 24.1673 21.3594C23.8358 21.7145 23.4097 22.1193 22.8888 22.5739L21.0423 24.1932V24.25H25.3888V25.5H18.8263Z" fill="black"/>
                </svg>`
            },
            superscript: {
                command: 'superscript',
                tooltip: 'Superscript',
                icon: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="2" fill="white"/>
                <path d="M7.61364 8.45455L11.3636 14.5057H11.4773L15.2273 8.45455H17.3011L12.7273 15.7273L17.3011 23H15.2273L11.4773 17.0625H11.3636L7.61364 23H5.53977L10.2273 15.7273L5.53977 8.45455H7.61364ZM18.8263 15.7273V14.6193L22.1502 11.6648C22.4817 11.3712 22.7586 11.1084 22.9812 10.8764C23.2037 10.6444 23.3718 10.4195 23.4854 10.2017C23.5991 9.9839 23.6559 9.75189 23.6559 9.50568C23.6559 9.07954 23.4925 8.741 23.1658 8.49006C22.8391 8.23911 22.4343 8.11364 21.9513 8.11364C21.44 8.11364 21.0281 8.25095 20.7156 8.52557C20.4031 8.79545 20.2468 9.15057 20.2468 9.59091H18.7695C18.7695 8.78125 19.0702 8.13021 19.6715 7.63778C20.2728 7.14062 21.0423 6.89205 21.9798 6.89205C22.6048 6.89205 23.154 7.00568 23.6275 7.23295C24.101 7.45549 24.4703 7.76326 24.7354 8.15625C25.0006 8.54451 25.1332 8.98485 25.1332 9.47727C25.1332 9.86553 25.055 10.2254 24.8988 10.5568C24.7425 10.8883 24.4987 11.2315 24.1673 11.5866C23.8358 11.9418 23.4097 12.3466 22.8888 12.8011L21.0423 14.4205V14.4773H25.3888V15.7273H18.8263Z" fill="black"/>
                </svg>`
            }
        },
        buttons: [
            'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'latex',
            '|', 'ul', 'ol', 'indent', 'outdent', 'Line height', '|',
            'brush', 'paragraph', '|', 'image', '|', 'table', '|', 'align',
            'undo', 'redo', '|', 'hr', 'eraser',
        ],
        uploader: {
            insertImageAsBase64URI: true
        },
    }), [showLatexDialog]);

    const handleDownload = () => {
        if (questionContent) {
            const wrappedContent = `<div class="question_printable_text">${questionContent}</div>`;

            const blob = new Blob([wrappedContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = 'question-content.html';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
        } else {
            return alert("Download complete🍾! Just kidding...there's nothing to download.😇")
        }
    };


    return (
        <div className='editor'>
            <h2>Editor with LaTeX/MathJax Support</h2>
            <JoditEditor
                ref={editor}
                config={config}
                tabIndex={1}
                onBlur={(newContent) => contentChange(newContent)}
            />
            <button style={{ padding: "10px", alignSelf: "flex-start", cursor:"pointer" }}
                onClick={handleDownload}
            >Download file
            </button>
        </div>
    );
};

export default JoditEditorWithLatex;