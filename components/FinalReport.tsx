import React from 'react';
import { Applicant, EvaluationData, Evaluator, CATEGORIES } from '../types';

interface FinalReportProps {
  applicants: Applicant[];
  evaluators: Evaluator[];
  allEvaluations: EvaluationData[];
  onClose: () => void;
}

export const FinalReport: React.FC<FinalReportProps> = ({ applicants, evaluators, allEvaluations, onClose }) => {
  
  const handlePrint = () => {
    window.print();
  };

  // Helper to get score - null means not submitted
  const getScore = (appId: string, evalId: string): number | null => {
    const evaluation = allEvaluations.find(e => e.applicantId === appId && e.evaluatorId === evalId);
    return evaluation ? evaluation.total : null;
  };

  const getRank = (appId: string, sortedApps: {id: string, total: number | null}[]) => {
    const index = sortedApps.findIndex(a => a.id === appId);
    return index + 1;
  };

  // Calculate totals for ranking (only count submitted evaluations)
  const applicantStats = applicants.map(app => {
    const appScores = evaluators.map(ev => getScore(app.id, ev.id)).filter(s => s !== null) as number[];
    const totalScore = appScores.length > 0 ? appScores.reduce((a, b) => a + b, 0) : null;
    const avgScore = appScores.length > 0 ? appScores.reduce((a, b) => a + b, 0) / appScores.length : null;
    return { id: app.id, total: totalScore, avg: avgScore };
  }).sort((a, b) => (b.total ?? -1) - (a.total ?? -1));

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto flex flex-col">
      <div className="no-print p-4 bg-slate-800 text-white flex justify-between items-center shadow-md sticky top-0">
        <h2 className="text-xl font-bold">최종 평가 결과 집계표</h2>
        <div className="space-x-4">
          <button onClick={handlePrint} className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white font-medium">
            인쇄하기 / PDF 저장
          </button>
          <button onClick={onClose} className="bg-slate-600 hover:bg-slate-700 px-4 py-2 rounded text-white font-medium">
            닫기
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 max-w-[297mm] mx-auto bg-white w-full">
        {/* Printable Area Header */}
        <div className="text-center mb-10 border-b-2 border-black pb-4">
          <h1 className="text-3xl font-bold text-black mb-2">신입사원 채용 면접 평가 종합표</h1>
          <p className="text-gray-600">평가일자: {new Date().toLocaleDateString()}</p>
        </div>

        {/* The Matrix Table */}
        <table className="w-full border-collapse border border-black mb-12 text-sm">
          <thead>
            <tr className="bg-gray-100 text-center">
              <th className="border border-black p-2 w-12">순위</th>
              <th className="border border-black p-2 w-24">성명</th>
              <th className="border border-black p-2 w-32">지원분야</th>
              {evaluators.map(ev => (
                <th key={ev.id} className="border border-black p-2">{ev.name} 위원</th>
              ))}
              <th className="border border-black p-2 bg-blue-50 font-bold">총점 합계</th>
              <th className="border border-black p-2 bg-blue-50 font-bold">평균</th>
              <th className="border border-black p-2 w-24">비고</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((app) => {
              const stats = applicantStats.find(s => s.id === app.id);
              const total = stats?.total || 0;
              const avg = stats?.avg || 0;
              const rank = getRank(app.id, applicantStats);

              return (
                <tr key={app.id} className="text-center hover:bg-gray-50">
                  <td className="border border-black p-2 font-bold">{rank}</td>
                  <td className="border border-black p-2">{app.name}</td>
                  <td className="border border-black p-2">{app.position}</td>
                  {evaluators.map(ev => {
                    const score = getScore(app.id, ev.id);
                    return (
                      <td key={ev.id} className="border border-black p-2">
                        {score !== null ? score : '-'}
                      </td>
                    );
                  })}
                  <td className="border border-black p-2 font-bold bg-blue-50">{total !== null ? total : '-'}</td>
                  <td className="border border-black p-2 font-bold bg-blue-50">{avg !== null ? avg.toFixed(1) : '-'}</td>
                  <td className="border border-black p-2"></td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Criteria Summary */}
        <div className="mb-12">
          <h3 className="font-bold text-lg mb-2">※ 평가 항목 및 배점</h3>
          <div className="grid grid-cols-5 gap-2 text-xs border border-gray-300 p-4 rounded">
            {CATEGORIES.map(cat => (
              <div key={cat.id} className="text-center">
                <div className="font-bold">{cat.label}</div>
                <div>({cat.maxScore}점)</div>
              </div>
            ))}
            <div className="col-span-5 text-right mt-2 font-bold border-t pt-2">총점: 100점 만점</div>
          </div>
        </div>

        {/* Signatures Area */}
        <div className="flex justify-end gap-8 mt-20">
            {evaluators.map((ev) => (
                <div key={ev.id} className="flex flex-col items-center w-32">
                    <div className="mb-8 font-bold text-black">{ev.name} 평가위원</div>
                    <div className="w-full border-b border-black h-8 relative">
                        <span className="absolute bottom-1 right-0 text-xs text-gray-400">(서명)</span>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};