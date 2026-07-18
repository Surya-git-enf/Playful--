if (typeof window !== 'undefined') {
        sessionStorage.setItem('playful_new', '1')
      }
      // Redirect to dashboard after successful sign up
      router.push('/dashboard')
      setSignUpLoading(false)