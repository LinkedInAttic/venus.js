# .bash_profile

# Get the aliases and functions
if [ -f ~/.bashrc ]; then
	. ~/.bashrc
fi

# bash completion
GIT_COMPLETION_PATH=/etc/bash_completion.d/git
if [ -f $GIT_COMPLETION_PATH ]; then
  . $GIT_COMPLETION_PATH
  GIT_PS1_SHOWDIRTYSTATE=true # */+ for dirty
  GIT_PS1_SHOWSTASHSTATE=true # $ for stashes
  GIT_PS1_SHOWUNTRACKEDFILES=true # % for untracked
fi

# User specific environment and startup programs
PATH=$PATH:$HOME/bin

if [ -x /usr/bin/keychain ] ; then
	MYNAME=`/usr/bin/whoami`
	if [ -f ~/.ssh/${MYNAME}_at_linkedin.com_dsa_key ] ; then
	      /usr/bin/keychain ~/.ssh/${MYNAME}_at_linkedin.com_dsa_key
      	      . ~/.keychain/`hostname`-sh
	fi
fi

export QUICK_DEPLOY="/home/smclaugh/src/quick-deploy"
# Quick Deploy defaults
#QD_BACKENDS="profile-svcs"
#QD_CONTAINERS="services-container tomcat"
QD_CONTAINERS="tomcat"
#QD_SERVICES="scds mupld mpr nmp leo uas demo college typeahead nprofile profile-services leocs fetch reg redirect fronttest pal"
QD_SERVICES="scds chrome plato mupld mpr nmp leo uas demo college typeahead nprofile"
#QD_SERVICES="scds uas college mupld mpr"
QD_ANT_PROPERTIES=""
#export QD_BACKENDS QD_CONTAINERS QD_SERVICES QD_ANT_PROPERTIES
export QD_CONTAINERS QD_SERVICES QD_ANT_PROPERTIES

export NETREPO=svn+ssh://svn.corp.linkedin.com/netrepo/network
export LIREPO=svn+ssh://svn.corp.linkedin.com/lirepo
export VENREPO=svn+ssh://svn.corp.linkedin.com/vendor

export JAVA_HOME=/export/apps/jdk/JDK-1_6_0_27
export JDK_HOME=/export/apps/jdk/JDK-1_6_0_27
export ORACLE_HOME=/local/instantclient_10_2
export TNS_ADMIN=/local/instantclient_10_2
export NLS_LANG=American_America.UTF8

export LD_LIBRARY_PATH=/local/instantclient_10_2

export ORACLE_SID=DB
export DOCTOR_JS=/home/smclaugh/tools/doctorjs/bin
export PATH=$JAVA_HOME/bin:/usr/local/bin:$PATH:/usr/local/mysql/bin:$ORACLE_HOME/bin:$DOCTOR_JS

export M2_HOME=/local/maven
export M2=$M2_HOME/bin

export ANT_HOME=/local/apache-ant-1.7.1
export ANT_OPTS="-Xms512m -Xmx2500m -XX:PermSize=256m -XX:MaxPermSize=1024m"

export GRADLE_HOME=/local/gradle-0.9.2

export LEOHOME=/home/smclaugh/src/repo/trunk

export PATH=$ORACLE_HOME:$ANT_HOME/bin:$GRADLE_HOME/bin:/usr/local/linkedin/bin:$PATH
export PATH=$PATH:/home/smclaugh/dev/phantomjs/bin
export PATH=/export/apps/xtools/bin:$PATH

# venus
export PATH=/home/smclaugh/dev/venus/bin:$PATH

export SVN_EDITOR=vim
export EDITOR=/usr/bin/vim
export PS1="\[$(tput bold)\]\[$(tput setaf 4)\]\u\[$(tput setaf 6)\]@\h \[$(tput setaf 2)\]\w\[$(tput setaf 7)\] \[$(tput sgr0)\]"
#export TERM="ansi"
export TERM="xterm-256color"

# kafka
export KAFKA_HOME=/home/smclaugh/dev/kafka

#scala
export SCALA_HOME=/usr/local/scala/bin

# maven
export M2_HOME=/usr/local/apache-maven/apache-maven-3.0.4
export M2_HOME_BIN=/usr/local/apache-maven/apache-maven-3.0.4/bin
export PATH=$M2:$M2_HOME:$M2_HOME_BIN:$SCALA_HOME:$PATH

#intouch
export INTOUCH_HOME=/home/smclaugh/dev/intouch

#js-test-driver
export JSTESTDRIVER_HOME=/home/smclaugh/bin

# play
export PATH=/home/smclaugh/bin/play-2.0:$PATH

export WATCHIT=/home/smclaugh/src/network/content/test/js/tools/WatchIt

# git bash
. ~/.bash_git

# gtrunk
. ~/.gtrunk/gtrunk.sh
