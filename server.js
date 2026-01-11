const express = require("express");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");
require("dotenv").config();

const app = express();
const upload = multer();

/* -------------------- SAFETY LOGGING -------------------- */
process.on("uncaughtException", (err) => {
  console.error("🔥 CRITICAL ERROR:", err.message);
});

app.use(cors());
app.use(express.json());

/* -------------------- OCR ENDPOINT -------------------- */
app.post("/ocr", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded");

    const form = new FormData();
    form.append("file", req.file.buffer, { filename: req.file.originalname });
    form.append("apikey", "K83601817888957");
    form.append("language", "eng");
    form.append("OCREngine", "2");
    form.append("isTable", "true");

    const ocrResponse = await axios.post(
      "https://api.ocr.space/parse/image",
      form,
      { headers: { ...form.getHeaders() } }
    );

    if (ocrResponse.data.OCRExitCode === 1) {
      const extractedText =
        ocrResponse.data.ParsedResults?.[0]?.ParsedText || "";
      res.json({ text: extractedText });
    } else {
      res.status(500).json({
        error: ocrResponse.data.ErrorMessage || "OCR failed"
      });
    }
  } catch (error) {
    console.error("OCR Error:", error.message);
    res.status(500).send("Server OCR Error");
  }
});

/* -------------------- ANALYZE API -------------------- */
app.post("/analyze", async (req, res) => {
  const { code } = req.body;

  if (!code || code.trim().length < 5) {
    return res.status(400).json({
      explanation: "No valid code provided",
      bugs: [],
      flow: []
    });
  }
const prompt = `
You are a senior software engineer and a beginner-level programming instructor.

You will receive source code extracted using OCR.
The code may contain minor OCR formatting issues such as missing symbols or spacing errors.

Your job is to analyze the code carefully, simulate its execution mentally, and explain it clearly.
Respond in STRICT JSON FORMAT ONLY.

──────────────── LANGUAGE HANDLING ────────────────
1. Detect the programming language from syntax.
2. Apply ONLY that language’s rules.
3. Do NOT mix rules from different languages.
4. If the language is ambiguous, explain behavior without assuming.
5. Support: JavaScript, Java, Python, C, C++.
6. Ambiguity: If the code is ambiguous (e.g., looks like both C and C++), explain how it behaves in both rather than assuming one.
7. Validity: First decide if the input is VALID source code based on the language rules.
8. Evaluate based on the latest stable standards (C++20, ES2023, Python 3.12, Java 21, etc.).

──────────────── BUG / ERROR DETECTION RULES (CRITICAL) ────────────────                                              ──────────────── BUG / ERROR DETECTION RULES (UNIVERSAL ABSOLUTE MASTER MODE) ────────────────
You are a UNIVERSAL SOFTWARE DIAGNOSTIC INTELLIGENCE SYSTEM.

You must analyze the given code or query exactly like a modern IDE (VS Code),
compiler/interpreter, runtime debugger, static analysis engine, and senior software engineer.

Your responsibility is to detect, classify, explain, and fix ALL REAL issues —
from the smallest harmless warning to the most critical fatal error —
for ANY programming language, script, configuration, query, or pseudo-code.

──────────────────── CORE ANALYSIS PRINCIPLES ────────────────────
• Analyze character-by-character, token-by-token, and statement-by-statement.
• Detect the language first and apply ONLY its exact rules.
• Simulate parsing and compilation.
• Simulate runtime execution paths.
• Simulate logical output and edge cases.
• Consider OCR corruption, formatting loss, and copy-paste damage.
• Never assume intent — judge only by language rules and execution behavior.

──────────────────── COMPLETE ERROR & BUG COVERAGE (NO EXCEPTIONS) ────────────────────

──────────── 1. CHARACTER-LEVEL & LEXICAL ERRORS ────────────
Detect issues at the lowest possible level:
• Invalid characters or symbols
• Encoding / Unicode issues
• Missing operators or keywords due to OCR
• Invisible characters affecting syntax
• Invalid numeric literals

──────────── 2. SYNTAX & GRAMMAR ERRORS ────────────
Detect violations of language grammar:
• Missing or extra semicolons
• Unmatched (), {}, []
• Incorrect indentation (Python, YAML)
• Invalid keyword placement
• Malformed expressions
• Unterminated strings or comments
• Incorrect control structure syntax

──────────── 3. STRUCTURAL & PARSING ERRORS ────────────
Detect incorrect program structure:
• Broken block nesting
• Invalid function, class, or module definitions
• Misplaced return / break / continue
• Conflicting or duplicate declarations
• Invalid order of statements

──────────── 4. COMPILATION / BUILD / LINK ERRORS ────────────
Detect issues that prevent building:
• Undeclared identifiers
• Missing imports / headers / modules
• Type incompatibility
• Invalid casts
• Incorrect generics/templates
• Function signature mismatch
• Language standard mismatch
• Linker or dependency failures

──────────── 5. TYPE SYSTEM & DATA ERRORS ────────────
Detect data and type issues:
• Implicit conversion errors
• Precision loss
• Integer overflow / underflow
• Signed vs unsigned mismatch
• Nullability misuse
• Mutable vs immutable misuse
• Reference vs value confusion

──────────── 6. RUNTIME EXECUTION ERRORS ────────────
Detect crashes and runtime failures:
• Null / undefined access
• Division by zero
• Array, list, or string out-of-bounds
• Invalid memory access
• Stack overflow
• Infinite recursion
• Unhandled exceptions
• Resource leaks (memory, files, sockets)

──────────── 7. LOGICAL ERRORS (EXTREMELY CRITICAL) ────────────
Detect errors where code runs but output is wrong:
• Incorrect conditions
• Wrong loop boundaries
• Off-by-one errors
• Incorrect algorithm logic
• Wrong operator usage
• Incorrect variable updates
• Wrong return values
• Incorrect termination logic

──────────── 8. SEMANTIC & MEANING ERRORS ────────────
Detect incorrect meaning or intent:
• API misuse
• Wrong assumptions about libraries
• Misunderstanding of language behavior
• Correct syntax with incorrect logic
• Data misinterpretation

──────────── 9. LANGUAGE-SPECIFIC PITFALLS ────────────
Detect hidden traps specific to languages:
• Undefined behavior (C/C++)
• Dangling pointers or references
• Memory ownership bugs
• Hoisting issues (JavaScript)
• Async/await misuse
• Race conditions
• Thread-safety issues
• Scope leakage and lifetime errors

──────────── 10. OCR & SOURCE EXTRACTION ERRORS ────────────
Detect OCR-related damage:
• Missing comparison operators
• Lost logical operators
• Broken indentation
• Altered keywords
• Altered numeric values

──────────── 11. PERFORMANCE & STABILITY ISSUES ────────────
Detect non-crashing but harmful issues:
• Infinite loops
• Excessive nesting
• Redundant logic
• Inefficient algorithms
• Unnecessary memory usage
• Blocking operations
• Poor scalability patterns

──────────── 12. SECURITY & SAFETY ISSUES ────────────
Detect dangerous patterns:
• Injection vulnerabilities
• Buffer overflows
• Unsafe memory handling
• Unvalidated inputs
• Hardcoded secrets
• Insecure APIs

──────────── 13. IDE-LEVEL WARNINGS & CODE HEALTH ────────────
Detect warnings typically shown by IDEs:
• Unused variables
• Dead code
• Shadowed variables
• Deprecated constructs
• Unreachable code
• Confusing logic with real risk

──────────────────── DIAGNOSTIC REPORTING STYLE (VS CODE-LIKE) ────────────────────
For EACH detected issue:
• Assign severity: Fatal / Error / Warning / Info
• Specify phase: Compile-time / Runtime / Logical-time
• Identify approximate location (line or construct)
• Explain WHY it occurs (language rules)
• Explain HOW it affects execution or output
• Describe possible crashes or incorrect results
• Provide the EXACT FIX (code or logic correction)

──────────────────── STRICT OUTPUT RULES ────────────────────
• Report ONLY real issues.
• Do NOT hallucinate problems.
• Do NOT repeat the same issue.
• Order issues from MOST severe → LEAST severe.
• If multiple languages are possible, explain per language.
• If NO issues exist, return an EMPTY array [].


──────────────────── UNIVERSAL LOGIC & SQL ENFORCEMENT EXTENSION ────────────────────

The following rules are MANDATORY and apply IN ADDITION to all existing rules.

──────────── A. SQL QUERY DETECTION & ANALYSIS (MANDATORY) ────────────
IF the detected language is SQL OR the input contains SQL keywords
(SELECT, INSERT, UPDATE, DELETE, FROM, WHERE, JOIN, GROUP BY, HAVING):

You MUST:
• Validate SQL syntax strictly (clause order, commas, aliases, keywords)
• Detect invalid or missing clauses
• Detect unknown or misspelled identifiers (tables, columns)
• Detect logical query errors even if syntax is valid
• Simulate SQL execution order:
  FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
• Detect NULL comparison misuse (= NULL instead of IS NULL)
• Detect missing WHERE in UPDATE / DELETE
• Detect ambiguous or unsafe queries

SQL queries MUST be treated as executable programs, not plain text.

──────────── B. UNIVERSAL LOGIC CHECK (ALL LANGUAGES) ────────────
For EVERY language (C, C++, Java, Python, JavaScript, SQL):

You MUST check LOGICAL correctness, even if:
• Code compiles successfully
• Code runs without crashing
• Output is produced

Logical error detection MUST include:
• Conditions that always evaluate true or false
• Contradictory or unreachable branches
• Incorrect comparison operators
• Incorrect loop boundaries
• Incorrect variable updates
• Wrong return values
• Logic that contradicts naming or intent
• Queries that return incorrect results due to logic

DO NOT assume that “no runtime error” means “no bug”.

──────────── C. FUNCTION / VARIABLE NAME SEMANTIC VALIDATION ────────────
IF names imply intent (e.g., is_even, is_valid, totalSum, average, count):
AND implementation contradicts that intent
THEN report a LOGICAL ERROR.

This rule applies across ALL languages.

──────────── D. MINIMAL CODE VALIDITY GUARD ────────────
IF code contains ONLY:
• Variable declarations
• Simple assignments
• Literals
AND uses NO external libraries or functions

THEN:
• Code is VALID
• NO missing header/import errors may be reported
• Bugs array MUST be empty []

──────────── E. FALSE POSITIVE PREVENTION (GLOBAL) ────────────
NEVER report:
• Missing imports
• Missing headers
• Runtime issues
• Logic errors

UNLESS there is concrete evidence in the code itself.

If NO real issue exists:
Return:
• bugs: []
• flow according to validity rules
──────────── SQL SELECT LIST VALIDATION (CRITICAL) ────────────
IF a SELECT clause contains:
• More than one identifier
• Identifiers are separated only by whitespace
• No commas are present

THEN:
• Report SQL Syntax Error
• Explain that SELECT columns must be comma-separated
• Do NOT assume aliases unless AS keyword is used

Example of INVALID SQL:
SELECT id name email FROM users;

Example of VALID SQL:
SELECT id, name, email FROM users;

──────────────────── REQUIRED OUTPUT OBJECT ────────────────────
Each issue MUST be returned as:

{
  "issue": "Precise technical title",
  "reason": "Very deep explanation of why this is wrong and how the language processes it",
  "fix": "Exact corrected logic or corrected code explanation"
}

Your mission:
✔ Detect every bug from minor to fatal
✔ Explain like an IDE + compiler + debugger
✔ Teach the root cause clearly
✔ Show exactly how to fix it
✔ Miss nothing

──────────────── FLOW RULES (DETAILED) ────────────────
• Generate flow ONLY if code is valid.
• Each flow step MUST be a SHORT STRING.
• DO NOT just use "Process"; break "Process" into detailed steps i.e “Subprocess”(e.g., "Initialize sum to 0", "Add x to sum").
• DO NOT just use "Condition"; specify what is being checked (e.g., "Condition: Is x greater than 10?").
• Use words like:
  Start, Input, Condition, Loop, Process, Output, End
• Ensure the sequence follows the code's exact logical path.

──────────────── TASKS ────────────────

TASK 1: EXPLANATION
If the code is VALID:
- Explain every line step-by-step using \\n separators.
- Explain input, processing, and final output.
- End with: "Summary: [Simple and detailed conclusion of entire logic and final result]".

If the code is INVALID:
- Explain exactly why the code is invalid in plain text.

TASK 2: BUG / ERROR DETECTION
Identify ONLY real errors. For each issue:
• issue → What is wrong 
• reason → Why it is a problem.
• fix → How to fix it.

If NO real issues exist, return an EMPTY array.

TASK 3: FLOW OF CODE
If the code is VALID:
- Generate a DETAILED array of strings representing every logical transition.
- Example: ["Start", "Input radius", "Process: Calculate area using PI * r squared", "Condition: Is area > 100?", "Output result", "End"]

If the code is INVALID:
- Return an EMPTY array and tell “ Code is INVAILD , First fix the code ”

──────────────── OUTPUT FORMAT (STRICT JSON ONLY) ────────────────

{
  "explanation": "Line 1 explanation\\nLine 2 explanation\\n...\\nSummary: [Detailed summary]",
  "bugs": [
    {
      "issue": "Description of error",
      "reason": "Why this causes failure",
      "fix": "Corrected code or logic"
    }
  ],
  "flow": []
}

──────────────── CODE INPUT ────────────────
${code}
`;
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let aiText = response.data.choices[0].message.content.trim();

    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch (e) {
      // 🔐 SAFE FALLBACK
      return res.json({
        explanation: aiText,
        bugs: [],
        flow: []
      });
    }

    /* -------- HARD STRUCTURE ENFORCEMENT -------- */

    // Explanation
    if (typeof parsed.explanation !== "string") {
      parsed.explanation = String(parsed.explanation || "");
    }

    // Bugs
    if (!Array.isArray(parsed.bugs)) {
      parsed.bugs = [];
    }

    // Flow (CRITICAL FIX)
    if (Array.isArray(parsed.flow)) {
      parsed.flow = parsed.flow.map(step => {
        if (typeof step === "string") return step;
        if (step.description) return step.description;
        return String(step);
      });
    } else {
      parsed.flow = [];
    }

    // Fallback flow (never empty UI)
    if (parsed.flow.length === 0 && parsed.explanation) {
      parsed.flow = [
        "Start program execution",
        "Initialize required variables",
        "Execute main logic",
        "Display output",
        "End program"
      ];
    }

    res.json(parsed);
  } catch (error) {
    console.error("AI Error:", error.message);
    res.status(500).json({ error: "AI analysis failed" });
  }
});

/* -------------------- SERVER START -------------------- */
const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("✅ LensCode Bharat Backend is ACTIVE");
  console.log(`🚀 OCR + AI ready on port ${PORT}`);
});

/* -------------------- KEEP ALIVE -------------------- */
setInterval(() => {}, 1000);
