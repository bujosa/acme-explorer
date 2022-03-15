
export function LoginContainer ({ children }) {
  return (
    <section className='vh-100'>
      <div className='container py-5'>
        <div className='row d-flex justify-content-center align-items-center h-100'>
          <div className='col-12 col-md-8 col-lg-6 col-xl-5'>
            <div className='card shadow-2-strong' style={{ borderRadius: '1rem' }}>
              <div className='card-body p-5 text-center'>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
