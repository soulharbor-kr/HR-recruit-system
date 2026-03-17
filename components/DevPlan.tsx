import React from 'react';
import { Button } from './Button';
import { FileText, ArrowLeft, Printer } from 'lucide-react';

interface DevPlanProps {
  onClose: () => void;
}

export const DevPlan: React.FC<DevPlanProps> = ({ onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 print:p-0 print:bg-white">
      {/* Toolbar (Hidden on Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center no-print">
        <Button variant="secondary" onClick={onClose} className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> 돌아가기
        </Button>
        <div className="flex gap-2">
            <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded text-sm flex items-center">
                <span className="font-bold mr-1">Tip:</span> 인쇄 창에서 '대상'을 'PDF로 저장'으로 선택하세요.
            </div>
            <Button onClick={handlePrint} className="flex items-center">
            <Printer className="w-4 h-4 mr-2" /> PDF로 저장 / 인쇄
            </Button>
        </div>
      </div>

      {/* Document Page */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-xl p-[20mm] min-h-[297mm] print:shadow-none print:w-full">
        
        {/* Header */}
        <div className="border-b-2 border-slate-800 pb-4 mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">HR Recruitment Evaluation System</h1>
          <h2 className="text-xl text-slate-600">신입사원 채용 평가 시스템 개발 계획서</h2>
          <div className="mt-4 flex justify-between text-sm text-slate-500">
            <span>문서번호: DEV-2024-001</span>
            <span>작성일자: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8 text-slate-800 leading-relaxed">
          
          <section>
            <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-3 mb-3 bg-slate-50 py-1">1. 프로젝트 개요 (Project Overview)</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>목적:</strong> 종이 기반 면접 평가의 디지털화, 점수 집계 자동화, 결과 리포트 생성.</li>
              <li><strong>사용 대상:</strong> 면접 평가위원 (3~5명), 채용 관리자.</li>
              <li><strong>주요 특징:</strong>
                <ul className="list-circle pl-5 mt-1 text-slate-600">
                  <li>이력서(PDF)와 평가표 동시 조회 (Split View).</li>
                  <li>슬라이더 UI를 통한 직관적인 점수 입력.</li>
                  <li>Supabase 연동 및 오프라인(Local Storage) 하이브리드 지원.</li>
                  <li>서명란이 포함된 최종 집계표 자동 생성.</li>
                </ul>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-3 mb-3 bg-slate-50 py-1">2. 기술 스택 (Tech Stack)</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="border p-3 rounded bg-slate-50">
                <span className="font-bold block mb-1">Frontend</span>
                React 19, TypeScript, Tailwind CSS
              </div>
              <div className="border p-3 rounded bg-slate-50">
                <span className="font-bold block mb-1">Backend & Database</span>
                Supabase (PostgreSQL), Google Drive (File Storage)
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-3 mb-3 bg-slate-50 py-1">3. 기능 명세 (Functional Specs)</h3>
            <div className="space-y-3 text-sm">
                <div>
                    <strong className="block text-slate-900">A. 평가위원 모드</strong>
                    <p className="text-slate-600">로그인, 대시보드(진행률 확인), PDF 뷰어/평가표 Split View, 자동 점수 계산, 오프라인 저장 지원.</p>
                </div>
                <div>
                    <strong className="block text-slate-900">B. 관리자 및 리포트</strong>
                    <p className="text-slate-600">종합 집계표(Rank 산출), A4 가로 방향 인쇄 최적화, 평가위원 서명란 생성.</p>
                </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-3 mb-3 bg-slate-50 py-1">4. 데이터베이스 설계 (Supabase Schema)</h3>
            
            <div className="mb-4">
                <h4 className="font-bold text-sm mb-1 text-blue-800">4.1. Evaluators (평가위원)</h4>
                <table className="w-full text-xs border-collapse border border-slate-300">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="border p-1 text-left">Column</th>
                            <th className="border p-1 text-left">Type</th>
                            <th className="border p-1 text-left">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td className="border p-1">id (PK)</td><td className="border p-1">text</td><td className="border p-1">평가위원 ID</td></tr>
                        <tr><td className="border p-1">name</td><td className="border p-1">text</td><td className="border p-1">성명</td></tr>
                        <tr><td className="border p-1">role</td><td className="border p-1">text</td><td className="border p-1">권한 (admin/evaluator)</td></tr>
                    </tbody>
                </table>
            </div>

            <div>
                <h4 className="font-bold text-sm mb-1 text-blue-800">4.2. Evaluations (평가 결과)</h4>
                <table className="w-full text-xs border-collapse border border-slate-300">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="border p-1 text-left">Column</th>
                            <th className="border p-1 text-left">Type</th>
                            <th className="border p-1 text-left">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td className="border p-1">applicant_id (PK)</td><td className="border p-1">text</td><td className="border p-1">지원자 ID</td></tr>
                        <tr><td className="border p-1">evaluator_id (PK)</td><td className="border p-1">text</td><td className="border p-1">평가위원 ID</td></tr>
                        <tr><td className="border p-1">scores</td><td className="border p-1">jsonb</td><td className="border p-1">항목별 점수 JSON</td></tr>
                        <tr><td className="border p-1">total</td><td className="border p-1">int</td><td className="border p-1">총점</td></tr>
                    </tbody>
                </table>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-3 mb-3 bg-slate-50 py-1">5. 개발 일정 (Roadmap)</h3>
            <ul className="list-disc pl-5 text-sm space-y-1">
                <li><span className="bg-green-100 text-green-800 px-1 rounded text-xs font-bold mr-2">완료</span> <strong>Phase 1:</strong> 프로토타입 UI, Mock Data 로직, PDF 뷰어 연동</li>
                <li><span className="bg-yellow-100 text-yellow-800 px-1 rounded text-xs font-bold mr-2">진행중</span> <strong>Phase 2:</strong> Supabase DB 생성 및 API 연동</li>
                <li><span className="bg-slate-100 text-slate-800 px-1 rounded text-xs font-bold mr-2">예정</span> <strong>Phase 3:</strong> Vercel 배포, 모바일(태블릿) 테스트, 보안 강화</li>
            </ul>
          </section>

        </div>
        
        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
            Internal Use Only - Confidential
        </div>
      </div>
    </div>
  );
};