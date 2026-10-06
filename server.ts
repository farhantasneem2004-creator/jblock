import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { exec, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Check host JDK status
app.get('/api/system-jdk', (req: Request, res: Response) => {
  exec('javac -version', (javacErr, javacStdout, javacStderr) => {
    if (javacErr) {
      return res.json({
        available: false,
        version: 'None',
        error: 'javac not detected in environment PATH',
      });
    }

    const versionStr = (javacStdout || javacStderr || '').trim();
    const versionMatch = versionStr.match(/\d+(\.\d+)*/);
    const version = versionMatch ? versionMatch[0] : 'Installed';

    res.json({
      available: true,
      version,
      compiler: versionStr,
    });
  });
});

// Compile and run Java using system JDK
app.post('/api/compile-run', async (req: Request, res: Response) => {
  const { files, mainClass, inputs } = req.body as {
    files: Array<{ name: string; content: string }>;
    mainClass: string;
    inputs?: string[];
  };

  if (!files || !mainClass) {
    return res.status(400).json({ error: 'Missing files or mainClass' });
  }

  // Create unique temp directory
  const tempDir = path.join(os.tmpdir(), `jblock_${Date.now()}_${Math.random().toString(36).substring(7)}`);
  
  try {
    fs.mkdirSync(tempDir, { recursive: true });

    // Write all .java files
    for (const f of files) {
      if (f.name.endsWith('.java')) {
        fs.writeFileSync(path.join(tempDir, f.name), f.content, 'utf-8');
      }
    }

    // Step 1: Compile with javac
    const javaSourceFiles = files.filter(f => f.name.endsWith('.java')).map(f => `"${path.join(tempDir, f.name)}"`).join(' ');
    
    exec(`javac ${javaSourceFiles}`, { cwd: tempDir, timeout: 8000 }, (compileErr, compileStdout, compileStderr) => {
      if (compileErr) {
        const rawErrors = (compileStderr || compileStdout || compileErr.message).trim();
        // Clean up temp
        try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
        
        return res.json({
          success: false,
          stage: 'compilation',
          errors: rawErrors.split('\n'),
          output: [],
          exitCode: compileErr.code || 1,
        });
      }

      // Step 2: Run with java
      const runProcess = spawn('java', ['-cp', tempDir, mainClass], {
        cwd: tempDir,
        timeout: 10000,
      });

      const stdoutChunks: string[] = [];
      const stderrChunks: string[] = [];

      runProcess.stdout.on('data', (chunk) => {
        stdoutChunks.push(chunk.toString());
      });

      runProcess.stderr.on('data', (chunk) => {
        stderrChunks.push(chunk.toString());
      });

      if (inputs && inputs.length > 0) {
        runProcess.stdin.write(inputs.join('\n') + '\n');
        runProcess.stdin.end();
      }

      runProcess.on('close', (code) => {
        // Clean up temp
        try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}

        const outputStr = stdoutChunks.join('');
        const errorStr = stderrChunks.join('');

        res.json({
          success: code === 0,
          stage: 'execution',
          output: outputStr ? outputStr.split('\n') : [],
          errors: errorStr ? errorStr.split('\n') : [],
          exitCode: code || 0,
        });
      });

      runProcess.on('error', (err) => {
        try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
        res.json({
          success: false,
          stage: 'execution',
          errors: [err.message],
          output: stdoutChunks.join('').split('\n'),
          exitCode: 1,
        });
      });
    });

  } catch (err: any) {
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
    res.status(500).json({ error: err.message || 'Internal execution error' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`JBlock IDE running at http://localhost:${port}`);
  });
}

startServer();
