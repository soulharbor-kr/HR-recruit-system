import React, { useState, useEffect } from 'react';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { ScoreSlider } from './components/ScoreSlider';
import { FinalReport } from './components/FinalReport';
import { DevPlan } from './components/DevPlan'; // Import DevPlan
import { apiService } from './services/apiService';
import { Applicant, Evaluator, EvaluationData, CATEGORIES } from './types';
import { FileText, LogOut, CheckCircle, User, BarChart2, Cloud, AlertCircle, CloudOff } from 'lucide-react';

const INITIAL_SCORES = {
  jobCompetency: 10,
  motivation: 10,
  personality: 10,
  socialSkills: 10,
  impression: 10,
};

function App() {
  // Application State
  const [currentUser, setCurrentUser] = useState<Evaluator | null>(null);
  // Add 'devPlan' to view state
  const [view, setView] = useState<'login' | 'dashboard' | 'evaluate' | 'report' | 'devPlan'>('login');
  
  // Data State
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationData[]>([]);
  
  // Selection State
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [currentScores, setCurrentScores] = useState(INITIAL_SCORES);
  const [currentComment, setCurrentComment] = useState('');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [error, setError] = useState('');

  // Check Connection on Mount
  useEffect(() => {
    const isConnected = apiService.isServerConnected();
    console.log(
      `%c[System Status] Server Connection: ${isConnected ? 'ONLINE (Supabase)' : 'OFFLINE (Local Mode)'}`, 
      `color: ${isConnected ? 'green' : 'orange'}; font-weight: bold; font-size: 12px;`
    );
  }, []);

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
      setDataLoading(true);
      try {
        setLoadingStep('평가위원 정보 불러오는 중...');
        const evals = await apiService.getEvaluators();
        setEvaluators(evals);

        setLoadingStep('기존 평가 데이터 동기화 중...');
        const scores = await apiService.getEvaluations();
        setEvaluations(scores);
        
        setLoadingStep('구글 드라이브(파일 ID 확인) 연결 중...');
        const apps = await apiService.getApplicants();
        setApplicants(apps);
      } catch (e) {
        console.error(e);
        alert('데이터를 불러오는데 실패했습니다.');
      } finally {
        setDataLoading(false);
        setLoadingStep('');
      }
    };
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  // Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const user = await apiService.login(loginId, loginPw);
      if (user) {
        setCurrentUser(user);
        setView('dashboard');
      } else {
        setError('로그인 실패: 아이디/비밀번호를 확인하거나 Supabase 설정을 확인하세요.');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
    setLoginId('');
    setLoginPw('');
    setSelectedApplicant(null);
  };

  const startEvaluation = (applicant: Applicant) => {
    // Check if already evaluated
    const existing = evaluations.find(
      e => e.applicantId === applicant.id && e.evaluatorId === currentUser?.id
    );

    if (existing) {
      setCurrentScores(existing.scores);
      setCurrentComment(existing.comment || '');
    } else {
      setCurrentScores(INITIAL_SCORES);
      setCurrentComment('');
    }
    
    setSelectedApplicant(applicant);
    setView('evaluate');
  };

  const handleScoreChange = (category: keyof typeof currentScores, value: number) => {
    setCurrentScores(prev => ({ ...prev, [category]: value }));
  };

  const submitEvaluation = async () => {
    if (!currentUser || !selectedApplicant) return;
    
    setIsLoading(true);
    const total = apiService.calculateTotal(currentScores);
    
    const data: EvaluationData = {
      applicantId: selectedApplicant.id,
      evaluatorId: currentUser.id,
      scores: currentScores,
      total,
      comment: currentComment,
      submittedAt: new Date().toISOString()
    };

    try {
        const result = await apiService.saveEvaluation(data);
        
        // Refresh local state
        const updatedEvaluations = await apiService.getEvaluations();
        setEvaluations(updatedEvaluations);
        
        if (result.mode === 'local') {
            // alert('⚠️ 서버 연결에 실패하여 로컬 브라우저에 저장되었습니다. (데이터베이스 설정을 확인해주세요)');
        }

        setIsLoading(false);
        setView('dashboard');
        setSelectedApplicant(null);
    } catch (e) {
        alert("저장 중 심각한 오류가 발생했습니다.");
        setIsLoading(false);
    }
  };

  // --- Views ---

  if (view === 'devPlan') {
    return <DevPlan onClose={() => setView('login')} />;
  }

  if (view === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md relative">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800">채용 평가 시스템</h1>
            <p className="text-slate-500 mt-2">평가위원 로그인을 해주세요</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <Input 
              label="아이디" 
              value={loginId} 
              onChange={(e) => setLoginId(e.target.value)} 
              placeholder="예: eval1"
              className="bg-slate-700 text-white border-slate-600"
            />
            <Input 
              label="비밀번호" 
              type="password" 
              value={loginPw} 
              onChange={(e) => setLoginPw(e.target.value)} 
              placeholder="비밀번호 입력"
              className="bg-slate-700 text-white border-slate-600"
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full" isLoading={isLoading}>
              로그인
            </Button>
            
            {!apiService.isServerConnected() && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Server Connection Setup</h3>
                <div className="bg-slate-50 p-3 rounded text-xs text-slate-600 space-y-2">
                  <p className="flex items-start">
                    <AlertCircle className="w-3 h-3 mr-1 mt-0.5 text-blue-500 shrink-0" />
                    <span>Supabase 환경변수가 설정되지 않았습니다.</span>
                  </p>
                  <p className="text-slate-400 mt-1 pl-4">
                    현재 <b>테스트 모드(Mock Data)</b>로 실행됩니다.<br />
                    계정: eval1 / 123
                  </p>
                </div>
              </div>
            )}
          </form>

          {/* Dev Plan Trigger */}
          <div className="absolute top-4 right-4">
            <button 
                onClick={() => setView('devPlan')}
                className="text-xs text-slate-400 hover:text-blue-600 flex items-center transition-colors"
                title="개발계획서 보기"
            >
                <FileText className="w-4 h-4 mr-1" /> 개발계획서
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'report') {
    return (
      <FinalReport 
        applicants={applicants}
        evaluators={evaluators}
        allEvaluations={evaluations}
        onClose={() => setView('dashboard')}
      />
    );
  }

  // Loading Screen for Data Fetching
  if (dataLoading && view === 'dashboard') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-lg font-medium text-slate-700">{loadingStep}</p>
          <div className="text-sm text-slate-400">데이터베이스 동기화 중...</div>
        </div>
      </div>
    );
  }

  const EvaluatorDashboard = () => {
    const isConnected = apiService.isServerConnected();

    return (
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">지원자 목록</h2>
              {isConnected ? (
                <div className="flex items-center text-sm text-green-600 mt-1">
                   <Cloud className="w-4 h-4 mr-1" />
                   <span>Supabase & Google Drive 연동됨</span>
                </div>
              ) : (
                <div className="flex items-center text-sm text-orange-500 mt-1">
                   <CloudOff className="w-4 h-4 mr-1" />
                   <span>테스트 모드 (데이터가 로컬 브라우저에만 저장됨)</span>
                </div>
              )}
            </div>
            <div className="space-x-2">
                <Button variant="secondary" onClick={() => setView('report')}>
                    <BarChart2 className="w-4 h-4 mr-2 inline" />
                    종합 결과 보기
                </Button>
            </div>
          </div>
    
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applicants.map(app => {
              const isDone = evaluations.some(e => e.applicantId === app.id && e.evaluatorId === currentUser?.id);
              const myScore = evaluations.find(e => e.applicantId === app.id && e.evaluatorId === currentUser?.id)?.total;
    
              return (
                <div key={app.id} className={`bg-white rounded-lg shadow-sm border p-6 transition-all hover:shadow-md ${isDone ? 'border-green-200 bg-green-50' : 'border-slate-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{app.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center">
                        <FileText className="w-3 h-3 mr-1" />
                        {app.originalFilename}
                      </p>
                    </div>
                    {isDone ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" /> 완료 ({myScore}점)
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs font-bold">대기중</span>
                    )}
                  </div>
                  
                  <div className="text-sm text-slate-500 mb-6">
                    <p>지원일자: {app.applicationDate}</p>
                  </div>
    
                  <Button 
                    onClick={() => startEvaluation(app)} 
                    variant={isDone ? 'secondary' : 'primary'}
                    className="w-full"
                  >
                    {isDone ? '평가 수정하기' : '평가 시작하기'}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-slate-800">채용 평가 시스템</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              <User className="w-4 h-4 mr-2" />
              <span className="font-medium">{currentUser?.name}</span>
              <span className="mx-1 text-slate-400">|</span> 
              <span>{currentUser?.role === 'admin' ? '관리자' : '평가위원'}</span>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 no-print">
        {view === 'dashboard' && <EvaluatorDashboard />}
        
        {view === 'evaluate' && selectedApplicant && (
          <div className="h-[calc(100vh-7rem)] flex flex-col lg:flex-row gap-6">
            
            {/* Left: PDF Viewer */}
            <div className="flex-1 bg-slate-800 rounded-lg overflow-hidden shadow-lg flex flex-col">
              <div className="bg-slate-900 text-white p-3 flex justify-between items-center">
                <span className="font-medium flex items-center">
                  <FileText className="w-4 h-4 mr-2" /> 
                  지원서류: {selectedApplicant.originalFilename}
                </span>
                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
                    Google Drive 연결됨
                </span>
              </div>
              <div className="flex-1 bg-white relative">
                 <iframe 
                   src={selectedApplicant.pdfUrl} 
                   className="w-full h-full border-none"
                   title="PDF Viewer"
                 />
              </div>
            </div>

            {/* Right: Scoring Form */}
            <div className="w-full lg:w-[450px] bg-white rounded-lg shadow-lg border border-slate-200 flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-lg">
                <div className="flex justify-between items-center mb-1">
                    <h2 className="text-lg font-bold text-slate-800">{selectedApplicant.name} 평가</h2>
                    <span className="text-2xl font-bold text-blue-600">
                        {apiService.calculateTotal(currentScores)}
                        <span className="text-sm text-slate-400 font-normal"> / 100</span>
                    </span>
                </div>
                <p className="text-sm text-slate-500">{selectedApplicant.position}</p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {CATEGORIES.map(category => (
                  <ScoreSlider
                    key={category.id}
                    label={category.label}
                    description={category.description}
                    value={currentScores[category.id]}
                    max={category.maxScore}
                    onChange={(val) => handleScoreChange(category.id, val)}
                  />
                ))}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <h4 className="font-semibold text-slate-800 mb-2">특이사항 / 종합 의견</h4>
                  <textarea
                    value={currentComment}
                    onChange={(e) => setCurrentComment(e.target.value)}
                    placeholder="면접 중 특이사항이나 종합 의견을 자유롭게 입력하세요. (선택사항)"
                    className="w-full border border-slate-300 rounded-md p-3 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-lg flex gap-3">
                <Button variant="secondary" onClick={() => setView('dashboard')} className="flex-1">
                  취소
                </Button>
                <Button onClick={submitEvaluation} isLoading={isLoading} className="flex-[2]">
                  평가 완료 및 제출
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;