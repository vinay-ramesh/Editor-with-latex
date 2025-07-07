export const dialogContent = `<div style="padding: 20px; width: 500px;">
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
      </div>`