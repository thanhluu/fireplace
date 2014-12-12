import os

import fabdeploytools.envs
from fabric.api import env, lcd, local, task
from fabdeploytools import helpers

import deploysettings as settings

env.key_filename = settings.SSH_KEY
fabdeploytools.envs.loadenv(settings.CLUSTER)

ROOT, FIREPLACE = helpers.get_app_dirs(__file__)
COMMONPLACE = '%s/node_modules/.bin/commonplace' % FIREPLACE

if settings.ZAMBONI_DIR:
    ZAMBONI = '%s/zamboni' % settings.ZAMBONI_DIR
    ZAMBONI_PYTHON = '%s/venv/bin/python' % settings.ZAMBONI_DIR

os.environ['DJANGO_SETTINGS_MODULE'] = 'settings_local_mkt'
os.environ["PATH"] += os.pathsep + os.pathsep.join([COMMONPLACE])

PACKAGE_NAME = getattr(settings, 'PACKAGE_NAME', 'marketplace')


@task
def pre_update(ref):
    with lcd(FIREPLACE):
        local('git fetch')
        local('git fetch -t')
        local('git reset --hard %s' % ref)


@task
def update():
    with lcd(FIREPLACE):
        local('npm install')
        local('make install')
        local('cp src/media/js/settings_local_hosted.js src/media/js/settings_local.js')

        if settings.ZAMBONI_DIR:
            package_update()

        local('make build')
        local('node_modules/.bin/commonplace langpacks')


@task
def package_update():
    if settings.ENV != 'dev-feed':
        build_package(settings.ENV)
        upload_package(fireplace_package(settings.ENV), PACKAGE_NAME)


@task
def deploy():
    helpers.deploy(name=settings.PROJECT_NAME,
                   app_dir='fireplace',
                   env=settings.ENV,
                   cluster=settings.CLUSTER,
                   domain=settings.DOMAIN,
                   root=ROOT)


@task
def pre_update_latest_tag():
    current_tag_file = os.path.join(FIREPLACE, '.tag')
    latest_tag = helpers.git_latest_tag(FIREPLACE)
    with open(current_tag_file, 'r+') as f:
        if f.read() == latest_tag:
            print 'Environment is at %s' % latest_tag
        else:
            pre_update(latest_tag)
            f.seek(0)
            f.write(latest_tag)
            f.truncate()


@task
def build_package(package_env):
    with lcd(FIREPLACE):
        local('SERVER=%s node_modules/.bin/gulp package' % package_env)


@task
def upload_package(fireplace_package, package_name):
    with lcd(ZAMBONI):
        local('%s manage.py upload_new_marketplace_package %s %s '
              % (ZAMBONI_PYTHON, package_name, fireplace_package))


def fireplace_package(env):
    return '%s/package/builds/_%s.zip' % (FIREPLACE, env)
