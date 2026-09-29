import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckSquare, Award, ArrowRight, RotateCcw, AlertCircle } from 'lucide-react';
import { AssessmentQuestion } from '../types';
import { dataStore } from '../services/dataStore';
import { aiService } from '../services/aiService';

interface AssessmentRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillId: string;
  skillName: string;
  questions: AssessmentQuestion[];
  onComplete: () => void;
}

export const AssessmentRunnerModal: React.FC<AssessmentRunnerModalProps> = ({
  isOpen,
  onClose,
  skillId,
  skillName,
  questions,
  onComplete,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    passed: boolean;
    evaluations: Record<string, { correct: boolean; feedback: string }>;
  } | null>(null);

  if (!isOpen) return null;

  const currentQ = questions[currentIdx];

  const handleSelectOption = (opt: string) => {
    if (results) return;
    if (currentQ.type === 'multiple_select') {
      const currentList: string[] = answers[currentQ.id] || [];
      const updated = currentList.includes(opt)
        ? currentList.filter((x) => x !== opt)
        : [...currentList, opt];
      setAnswers({ ...answers, [currentQ.id]: updated });
    } else {
      setAnswers({ ...answers, [currentQ.id]: opt });
    }
  };

  const handleTextChange = (text: string) => {
    if (results) return;
    setAnswers({ ...answers, [currentQ.id]: text });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    let totalPoints = 0;
    let earnedPoints = 0;
    const evaluations: Record<string, { correct: boolean; feedback: string }> = {};

    for (const q of questions) {
      totalPoints += 100;
      const userAns = answers[q.id];

      if (q.type === 'mcq' || q.type === 'scenario') {
        const isCorrect = userAns === q.correctAnswer;
        if (isCorrect) earnedPoints += 100;
        evaluations[q.id] = {
          correct: isCorrect,
          feedback: isCorrect ? 'Correct! ' + q.explanation : 'Incorrect. ' + q.explanation,
        };
      } else if (q.type === 'multiple_select') {
        const correctList: string[] = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
        const userList: string[] = Array.isArray(userAns) ? userAns : [];
        const allCorrectSelected = correctList.every((item) => userList.includes(item));
        const noIncorrectSelected = userList.every((item) => correctList.includes(item));
        const isCorrect = allCorrectSelected && noIncorrectSelected;
        if (isCorrect) earnedPoints += 100;
        else if (allCorrectSelected) earnedPoints += 60;
        evaluations[q.id] = {
          correct: isCorrect,
          feedback: isCorrect ? 'All correct options selected.' : q.explanation,
        };
      } else if (q.type === 'short_answer') {
        // AI evaluation with deterministic fallback
        const aiEval = await aiService.evaluateOpenAnswer(q.question, userAns || '', skillName);
        earnedPoints += aiEval.data.score;
        evaluations[q.id] = {
          correct: aiEval.data.passed,
          feedback: aiEval.data.feedback,
        };
      }
    }

    const finalScore = Math.round(earnedPoints / questions.length);
    const passed = finalScore >= 70;

    dataStore.submitAssessment(skillId, answers, evaluations, finalScore);

    setResults({
      score: finalScore,
      passed,
      evaluations,
    });
    setIsSubmitting(false);
  };

  const handleFinish = () => {
    onComplete();
    onClose();
  };

  const resetAssessment = () => {
    setResults(null);
    setCurrentIdx(0);
    setAnswers({});
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/40 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl max-h-[90vh] virt-glass-strong rounded-2xl border border-[#111111]/18 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#111111]/12 bg-[#F1E9DD]/90 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#111111]/50 block">
                Technical Assessment Engine
              </span>
              <h3 className="font-extrabold text-base text-[#111111]">{skillName}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-[#DED0BD] text-[#111111]/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!results ? (
              <>
                {/* Progress Indicator */}
                <div className="flex items-center justify-between text-xs text-[#111111]/70 font-medium">
                  <span>
                    Question {currentIdx + 1} of {questions.length}
                  </span>
                  <span className="tabular-nums">
                    {Math.round(((currentIdx + 1) / questions.length) * 100)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#DED0BD] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                  />
                </div>

                {/* Scenario Context (if present) */}
                {currentQ.scenarioText && (
                  <div className="p-4 rounded-xl bg-[#DED0BD]/60 border border-[#111111]/15 text-xs text-[#111111] leading-relaxed">
                    <span className="font-bold block mb-1 uppercase tracking-wide text-[10px] text-[#111111]/60">
                      Scenario Brief
                    </span>
                    {currentQ.scenarioText}
                  </div>
                )}

                {/* Question Prompt */}
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#111111] leading-snug">
                    {currentQ.question}
                  </h4>
                  {currentQ.type === 'multiple_select' && (
                    <span className="text-[11px] text-[#111111]/60 italic block">
                      (Select all matching options)
                    </span>
                  )}
                </div>

                {/* Question Options or Text Area */}
                {currentQ.options ? (
                  <div className="space-y-2 pt-2">
                    {currentQ.options.map((opt, oIdx) => {
                      const isSelected =
                        currentQ.type === 'multiple_select'
                          ? (answers[currentQ.id] || []).includes(opt)
                          : answers[currentQ.id] === opt;

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectOption(opt)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-start gap-3 ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white border-transparent font-medium shadow-md'
                              : 'bg-[#F5EEE4] text-[#111111] border-[#111111]/15 hover:bg-[#DED0BD]'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-sm flex items-center justify-center border mt-0.5 ${
                              isSelected
                                ? 'bg-white border-white text-[#4F46E5]'
                                : 'border-[#111111]/30 bg-transparent'
                            }`}
                          >
                            {isSelected && <span className="w-2 h-2 bg-[#4F46E5] rounded-sm" />}
                          </span>
                          <span className="flex-1">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2 pt-2">
                    <textarea
                      rows={5}
                      placeholder="Type your technical explanation with architectural rationale..."
                      value={answers[currentQ.id] || ''}
                      onChange={(e) => handleTextChange(e.target.value)}
                      className="w-full p-3.5 text-xs rounded-xl bg-[#F5EEE4] border border-[#111111]/15 text-[#111111] focus:outline-none focus:border-[#111111] leading-relaxed"
                    />
                    <span className="text-[11px] text-[#111111]/60">
                      Evaluated by VIRTUOSO cognitive evaluation model based on precision and systems terminology.
                    </span>
                  </div>
                )}
              </>
            ) : (
              /* RESULTS SUMMARY */
              <div className="space-y-6 text-center py-4">
                <div className="inline-flex p-4 rounded-2xl bg-[#DED0BD] border border-[#111111]/20">
                  <Award className="w-10 h-10 text-[#111111]" />
                </div>

                <div>
                  <span className="text-xs uppercase font-bold tracking-widest text-[#111111]/60 block">
                    Diagnostic Score
                  </span>
                  <div className="text-4xl font-black text-[#111111] tabular-nums mt-1 font-['Cabinet_Grotesk']">
                    {results.score}%
                  </div>
                  <div className="mt-2">
                    {results.passed ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#111111] text-[#F5EEE4] text-xs font-bold rounded-sm">
                        ASSESSMENT PASSED — CAPABILITY UPGRADED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#DED0BD] text-[#111111] text-xs font-bold border border-[#111111] rounded-sm">
                        SCORE BELOW 70% THRESHOLD — PRACTICE RECOMMENDED
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-left space-y-3 pt-4 border-t border-[#111111]/12">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#111111]/60">
                    Question Feedback & Explanations
                  </h5>
                  {questions.map((q, idx) => {
                    const evalObj = results.evaluations[q.id];
                    return (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-xl bg-[#F5EEE4] border border-[#111111]/12 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between font-semibold text-[#111111]">
                          <span>Q{idx + 1}: {q.question.slice(0, 60)}...</span>
                          <span
                            className={`px-2 py-0.5 text-[10px] rounded-sm font-bold ${
                              evalObj?.correct
                                ? 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#06B6D4] text-white shadow-2xs'
                                : 'bg-[#DED0BD] text-[#111111] border border-[#111111]/30'
                            }`}
                          >
                            {evalObj?.correct ? 'CORRECT' : 'NEEDS REVIEW'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#111111]/80 leading-relaxed">
                          {evalObj?.feedback}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="px-6 py-4 border-t border-[#111111]/12 bg-[#F1E9DD]/90 flex items-center justify-between">
            {!results ? (
              <>
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(currentIdx - 1)}
                  className="px-4 py-2 text-xs font-semibold text-[#111111] hover:bg-[#DED0BD] disabled:opacity-30 rounded-xl transition-all"
                >
                  Previous
                </button>

                {currentIdx < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIdx(currentIdx + 1)}
                    className="virt-btn-primary px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="virt-btn-primary px-6 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5"
                  >
                    {isSubmitting ? 'Evaluating...' : 'Submit & Score Assessment'}
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={resetAssessment}
                  className="px-4 py-2 text-xs font-semibold text-[#111111] hover:bg-[#DED0BD] rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reattempt</span>
                </button>
                <button
                  onClick={handleFinish}
                  className="virt-btn-primary px-6 py-2 text-xs font-bold rounded-xl"
                >
                  Done & View Capability
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
