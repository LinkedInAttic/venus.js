while true
  do
    inotifywait -r -e modify -e move -e create -e delete ./source | while read line
      do
        echo "file changed; time to run make html"
        make html
        cp -r source/_static/* build/html/_static/
      done
  done
