I like Jest, and as you can probably tell, this package was set up to be tested
with it. Unfortunately some package-versions in its dependency tree have
security vulnerabilities, and I'm neither interested in 1) github and npm
complaining about them every time I commit or publish, nor 2) maintaining an
ever-decaying list of safe versions. 

My quick, lazy fix is to just remove Jest from the dev dependencies. Simply
running the global `jest` from the base directory Works On My Box, and shows
rather good coverage if I do say so myself. But don't take my word for it.

If you find any of this misguided, backwards, dirty, or otherwise unreasonable,
please do us both a favor, and open an issue explaining why. Thank you.
