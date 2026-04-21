import { codeResearcher } from '@/nodes/workers/codeResearcher.js';
import { CodeResearcherInput } from '@/types/code-researcher.types.js';

describe('CodeResearcher Helper', () => {
  it('should list files in the current directory', async () => {
    const input: CodeResearcherInput = {
      payload: {
        action: 'list_files',
        path: '.',
        recursive: false
      }
    };
    
    const result = await codeResearcher(input);
    expect(result.success).toBe(true);
    expect(result.data).toContain('package.json');
  });

  it('should read a specific file', async () => {
    const input: CodeResearcherInput = {
      payload: {
        action: 'read_file',
        path: 'package.json'
      }
    };
    
    const result = await codeResearcher(input);
    expect(result.success).toBe(true);
    expect(result.data).toContain('"name": "backend"');
  });

  it('should search for a pattern', async () => {
    const input: CodeResearcherInput = {
      payload: {
        action: 'search_pattern',
        pattern: 'SoftwareChiefDecisionSchema',
        path: 'src'
      }
    };
    
    const result = await codeResearcher(input);
    expect(result.success).toBe(true);
    expect(result.data).toContain('software_chief.ts');
  });
});
