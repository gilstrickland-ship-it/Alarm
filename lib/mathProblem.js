/**
 * Generate a simple random math problem for "proof of awake".
 * Uses addition and subtraction with numbers 1-20 for child-friendly difficulty.
 */
export function generateMathProblem() {
  const op = Math.random() < 0.5 ? "+" : "-";
  let a, b, answer;

  if (op === "+") {
    a = Math.floor(Math.random() * 12) + 1; // 1-12
    b = Math.floor(Math.random() * 12) + 1; // 1-12
    answer = a + b;
  } else {
    a = Math.floor(Math.random() * 15) + 5;  // 5-19
    b = Math.floor(Math.random() * (a - 1)) + 1; // 1 to a-1, so result is positive
    answer = a - b;
  }

  return {
    question: `${a} ${op} ${b}`,
    answer,
  };
}
