// BAD (Causes massive lag):
// {questions.map((q, index) => <QuestionComponent key={q.id} data={q} />)}

// GOOD (Instant load):
const currentQuestion = questions[currentIndex];
return (
  <div className="p-6">
    <QuestionComponent data={currentQuestion} />
    {/* Navigation buttons */}
  </div>
);
